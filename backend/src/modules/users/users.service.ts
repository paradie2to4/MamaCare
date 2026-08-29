import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: UserResponseDto['role'];
    preferredLanguage: string;
    createdAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };
  }

  async findMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.toResponse(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.toResponse(user);
  }
}
