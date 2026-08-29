import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, PartnerLinkStatus, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { MothersService } from '../mothers/mothers.service';
import { NotificationsService } from '../notifications/notifications.service';

const OPEN_STATUSES: PartnerLinkStatus[] = [PartnerLinkStatus.PENDING, PartnerLinkStatus.ACTIVE];

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mothersService: MothersService,
    private readonly appointmentsService: AppointmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async invite(motherUserId: string, email: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(motherUserId);

    const existingForMother = await this.prisma.partnerLink.findFirst({
      where: { motherProfileId, status: { in: OPEN_STATUSES } },
    });
    if (existingForMother) {
      throw new ConflictException('You already have a pending or active partner link.');
    }

    const partner = await this.prisma.user.findUnique({ where: { email } });
    if (!partner) {
      throw new NotFoundException('No account found with that email address.');
    }
    if (partner.role !== Role.PARTNER) {
      throw new BadRequestException('That account is not registered as a partner.');
    }

    const existingForPartner = await this.prisma.partnerLink.findFirst({
      where: { partnerUserId: partner.id, status: { in: OPEN_STATUSES } },
    });
    if (existingForPartner) {
      throw new ConflictException('That partner is already linked to another mother.');
    }

    const link = await this.prisma.partnerLink.create({
      data: { partnerUserId: partner.id, motherProfileId, status: PartnerLinkStatus.PENDING },
    });

    await this.notificationsService.createForUser(
      partner.id,
      NotificationType.SYSTEM,
      'New partner invite',
      'A mother has invited you to connect on MamaCare Rwanda.',
    );

    return {
      ...link,
      partner: { firstName: partner.firstName, lastName: partner.lastName, email: partner.email },
    };
  }

  async getMyLinkAsMother(motherUserId: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(motherUserId);
    const link = await this.prisma.partnerLink.findFirst({
      where: { motherProfileId, status: { in: OPEN_STATUSES } },
      orderBy: { invitedAt: 'desc' },
      include: { partner: { select: { firstName: true, lastName: true, email: true } } },
    });
    return link ?? null;
  }

  async revokeAsMother(motherUserId: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(motherUserId);
    const link = await this.prisma.partnerLink.findFirst({
      where: { motherProfileId, status: { in: OPEN_STATUSES } },
      orderBy: { invitedAt: 'desc' },
    });
    if (!link) {
      throw new NotFoundException('No active or pending partner link found.');
    }

    const updated = await this.prisma.partnerLink.update({
      where: { id: link.id },
      data: { status: PartnerLinkStatus.REVOKED },
    });

    await this.notificationsService.createForUser(
      link.partnerUserId,
      NotificationType.SYSTEM,
      'Partner link revoked',
      'Your connection to this mother has been revoked.',
    );

    return updated;
  }

  async getDashboardAsPartner(partnerUserId: string) {
    const link = await this.prisma.partnerLink.findFirst({
      where: { partnerUserId, status: { in: OPEN_STATUSES } },
      orderBy: { invitedAt: 'desc' },
      include: {
        motherProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!link) {
      return { status: 'NONE' as const, mother: null, nextAppointment: null };
    }

    if (link.status === PartnerLinkStatus.PENDING) {
      return {
        status: 'PENDING' as const,
        mother: {
          firstName: link.motherProfile.user.firstName,
          lastName: link.motherProfile.user.lastName,
        },
        nextAppointment: null,
      };
    }

    const nextAppointment = await this.appointmentsService.getNextAppointmentSummary(
      link.motherProfileId,
    );

    return {
      status: 'ACTIVE' as const,
      mother: {
        firstName: link.motherProfile.user.firstName,
        lastName: link.motherProfile.user.lastName,
      },
      nextAppointment,
    };
  }

  async acceptAsPartner(partnerUserId: string) {
    const link = await this.prisma.partnerLink.findFirst({
      where: { partnerUserId, status: PartnerLinkStatus.PENDING },
      orderBy: { invitedAt: 'desc' },
      include: { motherProfile: true },
    });
    if (!link) {
      throw new NotFoundException('No pending invite found.');
    }

    const updated = await this.prisma.partnerLink.update({
      where: { id: link.id },
      data: { status: PartnerLinkStatus.ACTIVE, acceptedAt: new Date() },
    });

    await this.notificationsService.createForUser(
      link.motherProfile.userId,
      NotificationType.SYSTEM,
      'Partner connected',
      'Your partner has accepted your invite.',
    );

    return updated;
  }
}
