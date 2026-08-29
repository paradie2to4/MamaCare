import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FollowUpPriority, FollowUpStatus, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChwService } from '../chw/chw.service';
import { MothersService } from '../mothers/mothers.service';
import { FollowUpsService } from './follow-ups.service';

describe('FollowUpsService', () => {
  let service: FollowUpsService;
  let prisma: {
    healthFollowUp: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let chwService: { assertMotherAssignedToChw: jest.Mock };
  let mothersService: { getProfileIdOrThrow: jest.Mock };

  beforeEach(async () => {
    prisma = {
      healthFollowUp: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    chwService = { assertMotherAssignedToChw: jest.fn() };
    mothersService = { getProfileIdOrThrow: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FollowUpsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ChwService, useValue: chwService },
        { provide: MothersService, useValue: mothersService },
      ],
    }).compile();

    service = moduleRef.get(FollowUpsService);
  });

  describe('createForMother', () => {
    it('rejects creating a follow-up for a mother not assigned to the CHW', async () => {
      chwService.assertMotherAssignedToChw.mockRejectedValue(new ForbiddenException());

      await expect(
        service.createForMother('chw-A', {
          motherProfileId: 'mother-B',
          reason: 'Missed appointment',
          priority: FollowUpPriority.MEDIUM,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates a follow-up assigned to the requesting CHW', async () => {
      chwService.assertMotherAssignedToChw.mockResolvedValue({ id: 'mother-A' });
      prisma.healthFollowUp.create.mockResolvedValue({ id: 'fu-1' });

      await service.createForMother('chw-A', {
        motherProfileId: 'mother-A',
        reason: 'Missed appointment',
        priority: FollowUpPriority.MEDIUM,
      });

      expect(prisma.healthFollowUp.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ assignedCHWId: 'chw-A' }) }),
      );
    });
  });

  describe('update / complete', () => {
    it('rejects updating a follow-up assigned to a different CHW', async () => {
      prisma.healthFollowUp.findUnique.mockResolvedValue({ id: 'fu-1', assignedCHWId: 'chw-B' });

      await expect(service.update('chw-A', 'fu-1', { notes: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException for a nonexistent follow-up', async () => {
      prisma.healthFollowUp.findUnique.mockResolvedValue(null);

      await expect(service.complete('chw-A', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('completes the CHW own follow-up', async () => {
      prisma.healthFollowUp.findUnique.mockResolvedValue({ id: 'fu-1', assignedCHWId: 'chw-A' });
      prisma.healthFollowUp.update.mockResolvedValue({
        id: 'fu-1',
        status: FollowUpStatus.RESOLVED,
      });

      const result = await service.complete('chw-A', 'fu-1');
      expect(result.status).toBe(FollowUpStatus.RESOLVED);
    });
  });

  describe('listForUser (mother-scoped)', () => {
    it('rejects a non-mother role', async () => {
      await expect(service.listForUser('user-chw', Role.CHW)).rejects.toThrow(ForbiddenException);
    });

    it("scopes the query to the caller's own mother profile", async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-A');
      prisma.healthFollowUp.findMany.mockResolvedValue([]);

      await service.listForUser('user-A', Role.MOTHER);

      expect(prisma.healthFollowUp.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { motherProfileId: 'mother-A' } }),
      );
    });
  });
});
