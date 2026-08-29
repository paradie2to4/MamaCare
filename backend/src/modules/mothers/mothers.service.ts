import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateMotherProfileDto } from './dto/update-mother-profile.dto';

@Injectable()
export class MothersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the caller's own MotherProfile id, creating an empty one if needed. */
  async getOrCreateProfileId(userId: string): Promise<string> {
    const existing = await this.prisma.motherProfile.findUnique({ where: { userId } });
    if (existing) {
      return existing.id;
    }
    const created = await this.prisma.motherProfile.create({ data: { userId } });
    return created.id;
  }

  /** Resolves the caller's own MotherProfile id, throwing if none exists yet. */
  async getProfileIdOrThrow(userId: string): Promise<string> {
    const profile = await this.prisma.motherProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Mother profile not found. Complete onboarding first.');
    }
    return profile.id;
  }

  /** Returns null (not a 404) when the profile doesn't exist yet, so the frontend can route to onboarding. */
  async getMyProfile(userId: string) {
    return this.prisma.motherProfile.findUnique({ where: { userId } });
  }

  async updateMyProfile(userId: string, dto: UpdateMotherProfileDto) {
    await this.getOrCreateProfileId(userId);
    return this.prisma.motherProfile.update({
      where: { userId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });
  }
}
