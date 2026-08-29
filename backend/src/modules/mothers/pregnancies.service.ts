import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MothersService } from './mothers.service';
import { CreatePregnancyDto, UpdatePregnancyDto } from './dto/pregnancy.dto';
import { getCurrentWeek } from './pregnancy-week.util';

const DEFAULT_GESTATION_DAYS = 280;

@Injectable()
export class PregnanciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mothersService: MothersService,
  ) {}

  private withCurrentWeek<T extends { lmpDate: Date; eddDate: Date }>(pregnancy: T) {
    return { ...pregnancy, currentWeek: getCurrentWeek(pregnancy.lmpDate) };
  }

  async listForUser(userId: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(userId);
    const pregnancies = await this.prisma.pregnancy.findMany({
      where: { motherProfileId },
      orderBy: { createdAt: 'desc' },
    });
    return pregnancies.map((p) => this.withCurrentWeek(p));
  }

  async getCurrentForUser(userId: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(userId);
    const pregnancy = await this.prisma.pregnancy.findFirst({
      where: { motherProfileId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return pregnancy ? this.withCurrentWeek(pregnancy) : null;
  }

  async createForUser(userId: string, dto: CreatePregnancyDto) {
    const motherProfileId = await this.mothersService.getOrCreateProfileId(userId);
    const lmpDate = new Date(dto.lmpDate);
    const eddDate = dto.eddDate
      ? new Date(dto.eddDate)
      : new Date(lmpDate.getTime() + DEFAULT_GESTATION_DAYS * 24 * 60 * 60 * 1000);

    const pregnancy = await this.prisma.pregnancy.create({
      data: { motherProfileId, lmpDate, eddDate, notes: dto.notes },
    });
    return this.withCurrentWeek(pregnancy);
  }

  async updateForUser(userId: string, pregnancyId: string, dto: UpdatePregnancyDto) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(userId);
    const pregnancy = await this.prisma.pregnancy.findUnique({ where: { id: pregnancyId } });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy not found.');
    }
    if (pregnancy.motherProfileId !== motherProfileId) {
      throw new ForbiddenException("You cannot access another mother's pregnancy.");
    }

    const updated = await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: {
        ...dto,
        eddDate: dto.eddDate ? new Date(dto.eddDate) : undefined,
      },
    });
    return this.withCurrentWeek(updated);
  }
}
