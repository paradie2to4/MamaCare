import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EducationCategory } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EducationService } from './education.service';

describe('EducationService', () => {
  let service: EducationService;
  let prisma: { educationArticle: { findMany: jest.Mock; findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { educationArticle: { findMany: jest.fn(), findUnique: jest.fn() } };

    const moduleRef = await Test.createTestingModule({
      providers: [EducationService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(EducationService);
  });

  it('filters the article list by category when provided', async () => {
    prisma.educationArticle.findMany.mockResolvedValue([]);

    await service.list({ category: EducationCategory.NUTRITION });

    expect(prisma.educationArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
          category: EducationCategory.NUTRITION,
        }),
      }),
    );
  });

  it('throws NotFoundException for a missing slug', async () => {
    prisma.educationArticle.findUnique.mockResolvedValue(null);

    await expect(service.getBySlug('missing-slug')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException for an unpublished article', async () => {
    prisma.educationArticle.findUnique.mockResolvedValue({ slug: 'draft', isPublished: false });

    await expect(service.getBySlug('draft')).rejects.toThrow(NotFoundException);
  });

  it('returns a published article by slug', async () => {
    prisma.educationArticle.findUnique.mockResolvedValue({
      slug: 'nutrition-basics',
      isPublished: true,
    });

    const result = await service.getBySlug('nutrition-basics');
    expect(result.slug).toBe('nutrition-basics');
  });
});
