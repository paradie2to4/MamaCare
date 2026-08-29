export const APPOINTMENT_CREATED = 'appointment.created';
export const APPOINTMENT_MISSED = 'appointment.missed';

export interface AppointmentCreatedEvent {
  appointmentId: string;
  motherUserId: string;
  type: string;
  scheduledAt: string;
  facilityName: string;
}

export interface AppointmentMissedEvent {
  appointmentId: string;
  motherProfileId: string;
}
