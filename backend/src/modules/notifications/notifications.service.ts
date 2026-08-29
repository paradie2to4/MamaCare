import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: NotificationQueryDto) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(query.type ? { type: query.type } : {}),
        ...(query.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({ where: { userId, read: false } });
    return { count };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException("You cannot access another user's notification.");
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { count: result.count };
  }

  /** Internal helper used by other modules/consumers — not controller-exposed. */
  async createForUser(userId: string, type: NotificationType, title: string, message: string) {
    return this.prisma.notification.create({ data: { userId, type, title, message } });
  }
}
