import { z } from 'zod';

export const followUpPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const followUpStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const healthFollowUpSchema = z.object({
  id: z.string(),
  motherProfileId: z.string(),
  assignedCHWId: z.string().nullable().optional(),
  priority: followUpPrioritySchema,
  reason: z.string(),
  status: followUpStatusSchema,
  dueDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  motherProfile: z
    .object({ user: z.object({ firstName: z.string(), lastName: z.string() }) })
    .optional(),
});

export const healthFollowUpListSchema = z.array(healthFollowUpSchema);

export const createFollowUpFormSchema = z.object({
  motherProfileId: z.string().min(1, 'Please choose a mother.'),
  reason: z.string().min(1, 'Please describe the reason for follow-up.'),
  priority: followUpPrioritySchema,
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateFollowUpFormValues = z.infer<typeof createFollowUpFormSchema>;
