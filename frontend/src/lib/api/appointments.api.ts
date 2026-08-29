import { apiClient, unwrap } from './client';
import { appointmentListSchema, appointmentSchema, type CreateAppointmentFormValues } from '../schemas/appointments.schema';
import type { AppointmentStatus } from '../../types';

export async function fetchAppointments(status?: AppointmentStatus) {
  const response = await apiClient.get('/appointments', { params: status ? { status } : undefined });
  return appointmentListSchema.parse(unwrap(response));
}

export async function createAppointment(values: CreateAppointmentFormValues) {
  const response = await apiClient.post('/appointments', values);
  return appointmentSchema.parse(unwrap(response));
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const response = await apiClient.patch(`/appointments/${id}/status`, { status });
  return appointmentSchema.parse(unwrap(response));
}
