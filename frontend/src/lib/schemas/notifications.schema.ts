import { z } from 'zod';

export const notificationTypeSchema = z.enum(['APPOINTMENT', 'REMINDER', 'FOLLOW_UP', 'EDUCATION', 'SYSTEM']);

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const notificationListSchema = z.array(notificationSchema);

export const unreadCountSchema = z.object({ count: z.number() });
