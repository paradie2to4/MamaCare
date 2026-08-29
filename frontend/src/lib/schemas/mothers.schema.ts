import { z } from 'zod';

export const motherProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateOfBirth: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  cell: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
});

export const pregnancySchema = z.object({
  id: z.string(),
  motherProfileId: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'MISCARRIED', 'TERMINATED']),
  lmpDate: z.string(),
  eddDate: z.string(),
  notes: z.string().nullable().optional(),
  currentWeek: z.number(),
});

export const createPregnancyFormSchema = z.object({
  lmpDate: z.string().min(1, 'Please provide the first day of your last period.'),
  eddDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMotherProfileFormSchema = z.object({
  district: z.string().optional(),
  sector: z.string().optional(),
  cell: z.string().optional(),
  village: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type CreatePregnancyFormValues = z.infer<typeof createPregnancyFormSchema>;
export type UpdateMotherProfileFormValues = z.infer<typeof updateMotherProfileFormSchema>;
