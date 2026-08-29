import { randomBytes, createHash } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parseDurationMs } from '../../common/utils/duration.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';

const SALT_ROUNDS = 10;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private toUserResponse(user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: Role;
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

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(user: { id: string; email: string; role: Role }): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      },
    );

    const refreshToken = randomBytes(64).toString('hex');
    const refreshTtl = parseDurationMs(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
    );
    const refreshExpiresAt = new Date(Date.now() + refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string; refreshExpiresAt: Date }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const role = dto.role ?? Role.MOTHER;

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role,
        ...(role === Role.MOTHER ? { motherProfile: { create: {} } } : {}),
      },
    });

    const { accessToken, refreshToken, refreshExpiresAt } = await this.issueTokens(user);

    return {
      auth: { user: this.toUserResponse(user), accessToken },
      refreshToken,
      refreshExpiresAt,
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string; refreshExpiresAt: Date }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const { accessToken, refreshToken, refreshExpiresAt } = await this.issueTokens(user);

    return {
      auth: { user: this.toUserResponse(user), accessToken },
      refreshToken,
      refreshExpiresAt,
    };
  }

  async refresh(
    presentedRefreshToken: string | undefined,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string; refreshExpiresAt: Date }> {
    if (!presentedRefreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const tokenHash = this.hashRefreshToken(presentedRefreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    // Rotate: revoke the presented token and issue a brand new pair.
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const { accessToken, refreshToken, refreshExpiresAt } = await this.issueTokens(
      storedToken.user,
    );

    return {
      auth: { user: this.toUserResponse(storedToken.user), accessToken },
      refreshToken,
      refreshExpiresAt,
    };
  }

  async logout(presentedRefreshToken: string | undefined): Promise<void> {
    if (!presentedRefreshToken) {
      return;
    }
    const tokenHash = this.hashRefreshToken(presentedRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }
    return this.toUserResponse(user);
  }
}
