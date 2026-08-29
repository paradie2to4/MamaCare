import { z } from 'zod';

export const reminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  appointmentId: z.string().nullable().optional(),
  type: z.enum(['APPOINTMENT', 'MEDICATION', 'DAILY_TIP', 'CUSTOM']),
  title: z.string(),
  message: z.string(),
  scheduledFor: z.string(),
  status: z.enum(['PENDING', 'SENT', 'DISMISSED', 'FAILED']),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS']),
});

export const reminderListSchema = z.array(reminderSchema);
