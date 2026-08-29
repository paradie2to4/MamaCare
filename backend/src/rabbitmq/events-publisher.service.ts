import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  APPOINTMENT_CREATED,
  APPOINTMENT_MISSED,
  AppointmentCreatedEvent,
  AppointmentMissedEvent,
} from './events';
import { EVENTS_CLIENT } from './rabbitmq.constants';

@Injectable()
export class EventsPublisherService {
  private readonly logger = new Logger(EventsPublisherService.name);

  constructor(@Inject(EVENTS_CLIENT) private readonly client: ClientProxy) {}

  publishAppointmentCreated(payload: AppointmentCreatedEvent): void {
    this.emit(APPOINTMENT_CREATED, payload);
  }

  publishAppointmentMissed(payload: AppointmentMissedEvent): void {
    this.emit(APPOINTMENT_MISSED, payload);
  }

  /**
   * Fire-and-forget: a broker outage must never fail the HTTP request that
   * triggered the event, so we subscribe (to actually send the message) but
   * only ever log a warning on error, never await or rethrow.
   */
  private emit(pattern: string, payload: unknown): void {
    this.client.emit(pattern, payload).subscribe({
      error: (error: Error) =>
        this.logger.warn(`Failed to publish "${pattern}": ${error?.message}`),
    });
  }
}
