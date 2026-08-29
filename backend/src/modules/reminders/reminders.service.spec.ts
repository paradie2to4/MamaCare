import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ReminderChannel, ReminderStatus, ReminderType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: {
    reminder: { findMany: jest.Mock; create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      reminder: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [RemindersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(RemindersService);
  });

  it('creates a reminder scoped to the caller', async () => {
    prisma.reminder.create.mockResolvedValue({ id: 'reminder-1' });

    await service.create('user-A', {
      type: ReminderType.APPOINTMENT,
      title: 'ANC appointment tomorrow',
      message: 'Your appointment is scheduled for tomorrow at 10:00 AM.',
      scheduledFor: new Date().toISOString(),
      channel: ReminderChannel.IN_APP,
    });

    expect(prisma.reminder.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-A' }) }),
    );
  });

  it('lists only the caller reminders, optionally filtered by status', async () => {
    prisma.reminder.findMany.mockResolvedValue([]);

    await service.list('user-A', ReminderStatus.PENDING);

    expect(prisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-A', status: ReminderStatus.PENDING } }),
    );
  });

  it('rejects dismissing a nonexistent reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue(null);

    await expect(service.dismiss('user-A', 'missing')).rejects.toThrow(NotFoundException);
  });

  it("rejects dismissing another user's reminder", async () => {
    prisma.reminder.findUnique.mockResolvedValue({ id: 'reminder-1', userId: 'user-B' });

    await expect(service.dismiss('user-A', 'reminder-1')).rejects.toThrow(ForbiddenException);
  });

  it('dismisses the caller own reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue({ id: 'reminder-1', userId: 'user-A' });
    prisma.reminder.update.mockResolvedValue({
      id: 'reminder-1',
      status: ReminderStatus.DISMISSED,
    });

    const result = await service.dismiss('user-A', 'reminder-1');
    expect(result.status).toBe(ReminderStatus.DISMISSED);
  });
});
