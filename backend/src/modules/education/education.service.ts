import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EducationQueryDto } from './dto/education-query.dto';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: EducationQueryDto) {
    return this.prisma.educationArticle.findMany({
      where: {
        isPublished: true,
        ...(query.category ? { category: query.category } : {}),
        ...(query.pregnancyStage ? { pregnancyStage: query.pregnancyStage } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBySlug(slug: string) {
    const article = await this.prisma.educationArticle.findUnique({ where: { slug } });
    if (!article || !article.isPublished) {
      throw new NotFoundException('Article not found.');
    }
    return article;
  }
}
