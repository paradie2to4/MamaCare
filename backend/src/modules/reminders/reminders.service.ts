import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReminderDto } from './dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, status?: ReminderStatus) {
    return this.prisma.reminder.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async create(userId: string, dto: CreateReminderDto) {
    const reminder = await this.prisma.reminder.create({
      data: {
        userId,
        appointmentId: dto.appointmentId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        scheduledFor: new Date(dto.scheduledFor),
        channel: dto.channel,
      },
    });

    // TODO(Phase 2): publish a `reminder.created` event to the RabbitMQ "reminders"
    // exchange here once a broker is available, so a worker can dispatch it at
    // scheduledFor via email/SMS. See ARCHITECTURE.md for the intended wiring.

    return reminder;
  }

  async dismiss(userId: string, reminderId: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id: reminderId } });
    if (!reminder) {
      throw new NotFoundException('Reminder not found.');
    }
    if (reminder.userId !== userId) {
      throw new ForbiddenException("You cannot access another user's reminder.");
    }
    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: { status: ReminderStatus.DISMISSED },
    });
  }
}
