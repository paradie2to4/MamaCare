import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsPublisherService } from '../../rabbitmq/events-publisher.service';
import { MothersService } from '../mothers/mothers.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mothersService: MothersService,
    private readonly eventsPublisher: EventsPublisherService,
  ) {}

  /**
   * Resolves the motherProfileId a requester is allowed to act on.
   * Phase 1 only supports MOTHER requesters acting on their own profile;
   * the explicit requesterRole param lets Phase 2 add CHW/HEALTH_OFFICER
   * read access without reshaping this method's callers.
   */
  private async resolveMotherProfileId(requesterId: string, requesterRole: Role): Promise<string> {
    if (requesterRole === Role.MOTHER) {
      return this.mothersService.getProfileIdOrThrow(requesterId);
    }
    throw new ForbiddenException('This role cannot access appointments yet.');
  }

  async list(requesterId: string, requesterRole: Role, status?: AppointmentStatus) {
    const motherProfileId = await this.resolveMotherProfileId(requesterId, requesterRole);
    return this.prisma.appointment.findMany({
      where: { motherProfileId, ...(status ? { status } : {}) },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getOne(requesterId: string, requesterRole: Role, appointmentId: string) {
    const motherProfileId = await this.resolveMotherProfileId(requesterId, requesterRole);
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }
    if (appointment.motherProfileId !== motherProfileId) {
      throw new ForbiddenException("You cannot access another mother's appointment.");
    }
    return appointment;
  }

  async create(requesterId: string, requesterRole: Role, dto: CreateAppointmentDto) {
    const motherProfileId = await this.resolveMotherProfileId(requesterId, requesterRole);
    const appointment = await this.prisma.appointment.create({
      data: {
        motherProfileId,
        pregnancyId: dto.pregnancyId,
        createdByUserId: requesterId,
        type: dto.type,
        scheduledAt: new Date(dto.scheduledAt),
        facilityName: dto.facilityName,
        location: dto.location,
        notes: dto.notes,
      },
    });

    // Publishing an async event must never break appointment creation itself,
    // even if EventsPublisherService's own internal safety net were bypassed.
    try {
      this.eventsPublisher.publishAppointmentCreated({
        appointmentId: appointment.id,
        motherUserId: requesterId,
        type: appointment.type,
        scheduledAt: appointment.scheduledAt.toISOString(),
        facilityName: appointment.facilityName,
      });
    } catch (error) {
      this.logger.warn(`publishAppointmentCreated failed: ${(error as Error)?.message}`);
    }

    return appointment;
  }

  async update(
    requesterId: string,
    requesterRole: Role,
    appointmentId: string,
    dto: UpdateAppointmentDto,
  ) {
    await this.getOne(requesterId, requesterRole, appointmentId);
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async updateStatus(
    requesterId: string,
    requesterRole: Role,
    appointmentId: string,
    status: AppointmentStatus,
  ) {
    const existing = await this.getOne(requesterId, requesterRole, appointmentId);
    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Only fire on a genuine transition into MISSED, never on an idempotent re-PATCH.
    if (status === 'MISSED' && existing.status !== 'MISSED') {
      try {
        this.eventsPublisher.publishAppointmentMissed({
          appointmentId: updated.id,
          motherProfileId: updated.motherProfileId,
        });
      } catch (error) {
        this.logger.warn(`publishAppointmentMissed failed: ${(error as Error)?.message}`);
      }
    }

    return updated;
  }

  /**
   * Narrow, deliberately limited projection for a linked partner — never the
   * mother's full appointment list/profile. Returns null if there's no
   * upcoming appointment.
   */
  async getNextAppointmentSummary(motherProfileId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { motherProfileId, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' },
    });

    if (!appointment) {
      return null;
    }

    return {
      type: appointment.type,
      scheduledAt: appointment.scheduledAt,
      facilityName: appointment.facilityName,
      status: appointment.status,
    };
  }
}
