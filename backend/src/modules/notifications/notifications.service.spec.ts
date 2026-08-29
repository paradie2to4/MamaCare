import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('scopes list() to the caller', async () => {
    prisma.notification.findMany.mockResolvedValue([]);

    await service.list('user-A', {});

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-A' } }),
    );
  });

  it('rejects marking read a notification belonging to another user', async () => {
    prisma.notification.findUnique.mockResolvedValue({ id: 'notif-1', userId: 'user-B' });

    await expect(service.markRead('user-A', 'notif-1')).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException for a nonexistent notification', async () => {
    prisma.notification.findUnique.mockResolvedValue(null);

    await expect(service.markRead('user-A', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('marks the caller own notification as read', async () => {
    prisma.notification.findUnique.mockResolvedValue({ id: 'notif-1', userId: 'user-A' });
    prisma.notification.update.mockResolvedValue({ id: 'notif-1', read: true });

    const result = await service.markRead('user-A', 'notif-1');
    expect(result.read).toBe(true);
  });

  it('scopes markAllRead() to the caller', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.markAllRead('user-A');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-A', read: false } }),
    );
    expect(result.count).toBe(3);
  });

  it('creates a notification for a given user via createForUser', async () => {
    prisma.notification.create.mockResolvedValue({ id: 'notif-2' });

    await service.createForUser('user-A', NotificationType.SYSTEM, 'Welcome', 'Hello there');

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-A',
        type: NotificationType.SYSTEM,
        title: 'Welcome',
        message: 'Hello there',
      },
    });
  });
});
