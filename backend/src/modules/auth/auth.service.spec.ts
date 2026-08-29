import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  const baseUser = {
    id: 'user-1',
    firstName: 'Grace',
    lastName: 'Uwase',
    email: 'grace@example.com',
    phone: null,
    role: Role.MOTHER,
    preferredLanguage: 'en',
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '30d',
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        authService.register({
          firstName: 'Grace',
          lastName: 'Uwase',
          email: 'grace@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password before persisting', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(baseUser);

      await authService.register({
        firstName: 'Grace',
        lastName: 'Uwase',
        email: 'grace@example.com',
        password: 'Password123!',
      });

      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.passwordHash).not.toBe('Password123!');
      expect(await bcrypt.compare('Password123!', createArgs.data.passwordHash)).toBe(true);
      expect(createArgs.data.motherProfile).toEqual({ create: {} });
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword1', 10);
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

      await expect(
        authService.login({ email: baseUser.email, password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('issues tokens for correct credentials', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword1', 10);
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

      const result = await authService.login({
        email: baseUser.email,
        password: 'CorrectPassword1',
      });

      expect(result.auth.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rejects a missing token', async () => {
      await expect(authService.refresh(undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a revoked token', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: baseUser,
      });

      await expect(authService.refresh('some-token')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired token', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: baseUser,
      });

      await expect(authService.refresh('some-token')).rejects.toThrow(UnauthorizedException);
    });

    it('rotates a valid token', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: baseUser,
      });
      prisma.refreshToken.update.mockResolvedValue({});

      const result = await authService.refresh('some-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'rt-1' } }),
      );
      expect(result.auth.accessToken).toEqual(expect.any(String));
    });
  });
});
