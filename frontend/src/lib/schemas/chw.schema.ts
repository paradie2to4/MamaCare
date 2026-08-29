import { z } from 'zod';
import { healthFollowUpSchema } from './follow-ups.schema';

export const chwSummarySchema = z.object({
  totalAssigned: z.number(),
  onTrack: z.number(),
  followUpNeeded: z.number(),
  priority: z.number(),
});

export const pregnancySummarySchema = z.object({
  id: z.string(),
  status: z.string(),
  lmpDate: z.string(),
  eddDate: z.string(),
});

export const assignedMotherSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable().optional(),
  }),
  pregnancies: z.array(pregnancySummarySchema),
  followUps: z.array(healthFollowUpSchema),
});

export const assignedMotherListSchema = z.array(assignedMotherSchema);
