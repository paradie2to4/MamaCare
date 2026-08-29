import { Test } from '@nestjs/testing';
import { EventsPublisherService } from './events-publisher.service';
import { EVENTS_CLIENT } from './rabbitmq.constants';
import { APPOINTMENT_CREATED, APPOINTMENT_MISSED } from './events';

describe('EventsPublisherService', () => {
  let service: EventsPublisherService;
  let client: { emit: jest.Mock };

  beforeEach(async () => {
    client = { emit: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [EventsPublisherService, { provide: EVENTS_CLIENT, useValue: client }],
    }).compile();

    service = moduleRef.get(EventsPublisherService);
  });

  it('emits the appointment.created pattern with the given payload', () => {
    client.emit.mockReturnValue({ subscribe: jest.fn() });
    const payload = {
      appointmentId: 'appt-1',
      motherUserId: 'user-A',
      type: 'ANC_VISIT',
      scheduledAt: new Date().toISOString(),
      facilityName: 'Kacyiru Health Center',
    };

    service.publishAppointmentCreated(payload);

    expect(client.emit).toHaveBeenCalledWith(APPOINTMENT_CREATED, payload);
  });

  it('emits the appointment.missed pattern with the given payload', () => {
    client.emit.mockReturnValue({ subscribe: jest.fn() });
    const payload = { appointmentId: 'appt-1', motherProfileId: 'mother-1' };

    service.publishAppointmentMissed(payload);

    expect(client.emit).toHaveBeenCalledWith(APPOINTMENT_MISSED, payload);
  });

  it('never throws when the underlying emit stream errors (broker unavailable)', () => {
    client.emit.mockReturnValue({
      subscribe: ({ error }: { error: (e: Error) => void }) =>
        error(new Error('connect ECONNREFUSED')),
    });

    expect(() =>
      service.publishAppointmentCreated({
        appointmentId: 'appt-1',
        motherUserId: 'user-A',
        type: 'ANC_VISIT',
        scheduledAt: new Date().toISOString(),
        facilityName: 'Kacyiru Health Center',
      }),
    ).not.toThrow();
  });
});
