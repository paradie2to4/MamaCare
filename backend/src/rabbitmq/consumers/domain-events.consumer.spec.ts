import { Test } from '@nestjs/testing';
import { FollowUpPriority, NotificationType, ReminderType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { DomainEventsConsumer } from './domain-events.consumer';

describe('DomainEventsConsumer', () => {
  let consumer: DomainEventsConsumer;
  let prisma: {
    reminder: { create: jest.Mock };
    motherProfile: { findUnique: jest.Mock };
    appointment: { count: jest.Mock };
    healthFollowUp: { create: jest.Mock };
  };
  let notificationsService: { createForUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      reminder: { create: jest.fn() },
      motherProfile: { findUnique: jest.fn() },
      appointment: { count: jest.fn() },
      healthFollowUp: { create: jest.fn() },
    };
    notificationsService = { createForUser: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DomainEventsConsumer,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    consumer = moduleRef.get(DomainEventsConsumer);
  });

  describe('handleAppointmentCreated', () => {
    it('creates a reminder and notifies the mother', async () => {
      prisma.reminder.create.mockResolvedValue({ id: 'reminder-1' });

      await consumer.handleAppointmentCreated({
        appointmentId: 'appt-1',
        motherUserId: 'user-A',
        type: 'ANC_VISIT',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        facilityName: 'Kacyiru Health Center',
      });

      expect(prisma.reminder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-A',
            appointmentId: 'appt-1',
            type: ReminderType.APPOINTMENT,
          }),
        }),
      );
      expect(notificationsService.createForUser).toHaveBeenCalledWith(
        'user-A',
        NotificationType.APPOINTMENT,
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('handleAppointmentMissed', () => {
    it('skips gracefully when the mother no longer exists', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue(null);

      await consumer.handleAppointmentMissed({
        appointmentId: 'appt-1',
        motherProfileId: 'missing',
      });

      expect(prisma.healthFollowUp.create).not.toHaveBeenCalled();
    });

    it('creates a MEDIUM-priority follow-up on a first miss and notifies the assigned CHW', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue({ id: 'mother-1', assignedCHWId: 'chw-1' });
      prisma.appointment.count.mockResolvedValue(1);
      prisma.healthFollowUp.create.mockResolvedValue({ id: 'fu-1' });

      await consumer.handleAppointmentMissed({
        appointmentId: 'appt-1',
        motherProfileId: 'mother-1',
      });

      expect(prisma.healthFollowUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignedCHWId: 'chw-1',
            priority: FollowUpPriority.MEDIUM,
          }),
        }),
      );
      expect(notificationsService.createForUser).toHaveBeenCalledWith(
        'chw-1',
        NotificationType.FOLLOW_UP,
        expect.any(String),
        expect.any(String),
      );
    });

    it('escalates to URGENT on a third miss', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue({ id: 'mother-1', assignedCHWId: 'chw-1' });
      prisma.appointment.count.mockResolvedValue(3);
      prisma.healthFollowUp.create.mockResolvedValue({ id: 'fu-1' });

      await consumer.handleAppointmentMissed({
        appointmentId: 'appt-1',
        motherProfileId: 'mother-1',
      });

      expect(prisma.healthFollowUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: FollowUpPriority.URGENT }),
        }),
      );
    });

    it('creates an unassigned follow-up and skips notification when no CHW is assigned', async () => {
      prisma.motherProfile.findUnique.mockResolvedValue({ id: 'mother-1', assignedCHWId: null });
      prisma.appointment.count.mockResolvedValue(1);
      prisma.healthFollowUp.create.mockResolvedValue({ id: 'fu-1' });

      await consumer.handleAppointmentMissed({
        appointmentId: 'appt-1',
        motherProfileId: 'mother-1',
      });

      expect(prisma.healthFollowUp.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ assignedCHWId: null }) }),
      );
      expect(notificationsService.createForUser).not.toHaveBeenCalled();
    });
  });
});
