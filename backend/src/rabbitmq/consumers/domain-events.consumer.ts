import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationType, ReminderChannel, ReminderType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import {
  APPOINTMENT_CREATED,
  APPOINTMENT_MISSED,
  AppointmentCreatedEvent,
  AppointmentMissedEvent,
} from '../events';
import { deriveMissedAppointmentPriority } from '../priority.util';

const REMINDER_LEAD_TIME_MS = 24 * 60 * 60 * 1000;

@Controller()
export class DomainEventsConsumer {
  private readonly logger = new Logger(DomainEventsConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @EventPattern(APPOINTMENT_CREATED)
  async handleAppointmentCreated(@Payload() payload: AppointmentCreatedEvent): Promise<void> {
    const scheduledAt = new Date(payload.scheduledAt);
    const reminderTime = new Date(scheduledAt.getTime() - REMINDER_LEAD_TIME_MS);

    await this.prisma.reminder.create({
      data: {
        userId: payload.motherUserId,
        appointmentId: payload.appointmentId,
        type: ReminderType.APPOINTMENT,
        title: 'Upcoming appointment',
        message: `Your ${payload.type.replace('_', ' ').toLowerCase()} appointment at ${payload.facilityName} is coming up.`,
        scheduledFor: reminderTime > new Date() ? reminderTime : new Date(),
        channel: ReminderChannel.IN_APP,
      },
    });

    await this.notificationsService.createForUser(
      payload.motherUserId,
      NotificationType.APPOINTMENT,
      'Appointment scheduled',
      `Your appointment at ${payload.facilityName} has been scheduled.`,
    );

    this.logger.log(`Handled ${APPOINTMENT_CREATED} for appointment ${payload.appointmentId}`);
  }

  @EventPattern(APPOINTMENT_MISSED)
  async handleAppointmentMissed(@Payload() payload: AppointmentMissedEvent): Promise<void> {
    const mother = await this.prisma.motherProfile.findUnique({
      where: { id: payload.motherProfileId },
    });
    if (!mother) {
      this.logger.warn(`Mother ${payload.motherProfileId} not found for missed-appointment event`);
      return;
    }

    const missedCount = await this.prisma.appointment.count({
      where: { motherProfileId: payload.motherProfileId, status: 'MISSED' },
    });
    const priority = deriveMissedAppointmentPriority(missedCount);

    await this.prisma.healthFollowUp.create({
      data: {
        motherProfileId: payload.motherProfileId,
        assignedCHWId: mother.assignedCHWId,
        priority,
        reason: 'Missed a scheduled appointment',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    if (mother.assignedCHWId) {
      await this.notificationsService.createForUser(
        mother.assignedCHWId,
        NotificationType.FOLLOW_UP,
        'Follow-up needed',
        'One of your assigned mothers missed a scheduled appointment.',
      );
    }

    this.logger.log(`Handled ${APPOINTMENT_MISSED} for appointment ${payload.appointmentId}`);
  }
}
