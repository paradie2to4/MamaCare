import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpPriority, FollowUpStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ChwSummary {
  totalAssigned: number;
  onTrack: number;
  followUpNeeded: number;
  priority: number;
}

const PRIORITY_BUCKET: Record<FollowUpPriority, 'followUpNeeded' | 'priority'> = {
  LOW: 'followUpNeeded',
  MEDIUM: 'followUpNeeded',
  HIGH: 'priority',
  URGENT: 'priority',
};

const OPEN_STATUSES: FollowUpStatus[] = [FollowUpStatus.OPEN, FollowUpStatus.IN_PROGRESS];

@Injectable()
export class ChwService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The CHW-scoped ownership primitive: a CHW manages many mothers, so a
   * client-supplied motherProfileId is unavoidable and must be checked
   * against an allow-list (assignedCHWId) rather than derived, unlike the
   * mother-scoped pattern in MothersService.
   */
  async assertMotherAssignedToChw(chwUserId: string, motherProfileId: string) {
    const mother = await this.prisma.motherProfile.findUnique({ where: { id: motherProfileId } });
    if (!mother) {
      throw new NotFoundException('Mother not found.');
    }
    if (mother.assignedCHWId !== chwUserId) {
      throw new ForbiddenException('This mother is not assigned to you.');
    }
    return mother;
  }

  async listAssignedMothers(chwUserId: string) {
    return this.prisma.motherProfile.findMany({
      where: { assignedCHWId: chwUserId },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        pregnancies: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 },
        followUps: { where: { status: { in: OPEN_STATUSES } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMotherDetail(chwUserId: string, motherProfileId: string) {
    await this.assertMotherAssignedToChw(chwUserId, motherProfileId);
    return this.prisma.motherProfile.findUnique({
      where: { id: motherProfileId },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        pregnancies: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { scheduledAt: 'desc' } },
        followUps: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getSummary(chwUserId: string): Promise<ChwSummary> {
    const mothers = await this.prisma.motherProfile.findMany({
      where: { assignedCHWId: chwUserId },
      include: { followUps: { where: { status: { in: OPEN_STATUSES } } } },
    });

    const summary: ChwSummary = {
      totalAssigned: mothers.length,
      onTrack: 0,
      followUpNeeded: 0,
      priority: 0,
    };

    for (const mother of mothers) {
      if (mother.followUps.length === 0) {
        summary.onTrack += 1;
        continue;
      }
      const highestBucket = mother.followUps.some((f) => PRIORITY_BUCKET[f.priority] === 'priority')
        ? 'priority'
        : 'followUpNeeded';
      summary[highestBucket] += 1;
    }

    return summary;
  }
}
