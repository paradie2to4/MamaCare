import { apiClient, unwrap } from './client';
import { reminderListSchema, reminderSchema } from '../schemas/reminders.schema';
import type { ReminderStatus } from '../../types';

export async function fetchReminders(status?: ReminderStatus) {
  const response = await apiClient.get('/reminders', { params: status ? { status } : undefined });
  return reminderListSchema.parse(unwrap(response));
}

export async function dismissReminder(id: string) {
  const response = await apiClient.patch(`/reminders/${id}/dismiss`);
  return reminderSchema.parse(unwrap(response));
}
