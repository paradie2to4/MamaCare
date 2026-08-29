import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MothersService } from './mothers.service';
import { PregnanciesService } from './pregnancies.service';

describe('PregnanciesService', () => {
  let service: PregnanciesService;
  let prisma: {
    pregnancy: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let mothersService: { getProfileIdOrThrow: jest.Mock; getOrCreateProfileId: jest.Mock };

  beforeEach(async () => {
    prisma = {
      pregnancy: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    mothersService = {
      getProfileIdOrThrow: jest.fn().mockResolvedValue('mother-profile-A'),
      getOrCreateProfileId: jest.fn().mockResolvedValue('mother-profile-A'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PregnanciesService,
        { provide: PrismaService, useValue: prisma },
        { provide: MothersService, useValue: mothersService },
      ],
    }).compile();

    service = moduleRef.get(PregnanciesService);
  });

  it('rejects updating a pregnancy that does not exist', async () => {
    prisma.pregnancy.findUnique.mockResolvedValue(null);

    await expect(service.updateForUser('user-A', 'pregnancy-X', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it("rejects updating another mother's pregnancy", async () => {
    prisma.pregnancy.findUnique.mockResolvedValue({
      id: 'pregnancy-B',
      motherProfileId: 'mother-profile-B',
    });

    await expect(service.updateForUser('user-A', 'pregnancy-B', {})).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("allows updating the caller's own pregnancy", async () => {
    prisma.pregnancy.findUnique.mockResolvedValue({
      id: 'pregnancy-A',
      motherProfileId: 'mother-profile-A',
    });
    prisma.pregnancy.update.mockResolvedValue({
      id: 'pregnancy-A',
      motherProfileId: 'mother-profile-A',
      lmpDate: new Date('2026-01-01'),
      eddDate: new Date('2026-10-01'),
    });

    const result = await service.updateForUser('user-A', 'pregnancy-A', { notes: 'feeling well' });

    expect(result.id).toBe('pregnancy-A');
    expect(result).toHaveProperty('currentWeek');
  });
});
