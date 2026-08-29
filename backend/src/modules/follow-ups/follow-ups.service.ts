import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChwService } from '../chw/chw.service';
import { MothersService } from '../mothers/mothers.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto';

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chwService: ChwService,
    private readonly mothersService: MothersService,
  ) {}

  private async getOwnedOrThrow(chwUserId: string, followUpId: string) {
    const followUp = await this.prisma.healthFollowUp.findUnique({ where: { id: followUpId } });
    if (!followUp) {
      throw new NotFoundException('Follow-up not found.');
    }
    if (followUp.assignedCHWId !== chwUserId) {
      throw new ForbiddenException('This follow-up is not assigned to you.');
    }
    return followUp;
  }

  async createForMother(chwUserId: string, dto: CreateFollowUpDto) {
    await this.chwService.assertMotherAssignedToChw(chwUserId, dto.motherProfileId);
    return this.prisma.healthFollowUp.create({
      data: {
        motherProfileId: dto.motherProfileId,
        assignedCHWId: chwUserId,
        reason: dto.reason,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async listMine(chwUserId: string, status?: FollowUpStatus) {
    return this.prisma.healthFollowUp.findMany({
      where: { assignedCHWId: chwUserId, ...(status ? { status } : {}) },
      include: {
        motherProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(chwUserId: string, followUpId: string, dto: UpdateFollowUpDto) {
    await this.getOwnedOrThrow(chwUserId, followUpId);
    return this.prisma.healthFollowUp.update({
      where: { id: followUpId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async complete(chwUserId: string, followUpId: string) {
    await this.getOwnedOrThrow(chwUserId, followUpId);
    return this.prisma.healthFollowUp.update({
      where: { id: followUpId },
      data: { status: FollowUpStatus.RESOLVED },
    });
  }

  /** Mother-scoped, read-only — shown supportively, full history included. */
  async listForUser(requesterId: string, requesterRole: Role) {
    if (requesterRole !== Role.MOTHER) {
      throw new ForbiddenException('This role cannot access follow-ups this way.');
    }
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(requesterId);
    return this.prisma.healthFollowUp.findMany({
      where: { motherProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
