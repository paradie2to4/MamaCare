import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FollowUpPriority, FollowUpStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChwService } from './chw.service';

describe('ChwService', () => {
  let service: ChwService;
  let prisma: { motherProfile: { findUnique: jest.Mock; findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      motherProfile: { findUnique: jest.fn(), findMany: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ChwService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ChwService);
  });

  describe('assertMotherAssignedToChw', () => {
    it('throws NotFoundException for a nonexistent mother', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue(null);

      await expect(service.assertMotherAssignedToChw('chw-A', 'mother-X')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('denies CHW A access to a mother assigned to CHW B', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue({
        id: 'mother-1',
        assignedCHWId: 'chw-B',
      });

      await expect(service.assertMotherAssignedToChw('chw-A', 'mother-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows a CHW to access their own assigned mother', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue({
        id: 'mother-1',
        assignedCHWId: 'chw-A',
      });

      const result = await service.assertMotherAssignedToChw('chw-A', 'mother-1');
      expect(result.id).toBe('mother-1');
    });
  });

  describe('listAssignedMothers', () => {
    it('scopes the query to the requesting CHW', async () => {
      prisma.motherProfile.findMany.mockResolvedValue([]);

      await service.listAssignedMothers('chw-A');

      expect(prisma.motherProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { assignedCHWId: 'chw-A' } }),
      );
    });
  });

  describe('getSummary', () => {
    it('buckets mothers by their highest open follow-up priority', async () => {
      prisma.motherProfile.findMany.mockResolvedValue([
        { id: 'm1', followUps: [] },
        { id: 'm2', followUps: [{ priority: FollowUpPriority.LOW, status: FollowUpStatus.OPEN }] },
        {
          id: 'm3',
          followUps: [{ priority: FollowUpPriority.URGENT, status: FollowUpStatus.OPEN }],
        },
      ]);

      const summary = await service.getSummary('chw-A');

      expect(summary).toEqual({
        totalAssigned: 3,
        onTrack: 1,
        followUpNeeded: 1,
        priority: 1,
      });
    });
  });
});
