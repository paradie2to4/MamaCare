import { z } from 'zod';

export const appointmentTypeSchema = z.enum([
  'ANC_VISIT',
  'ULTRASOUND',
  'LAB_TEST',
  'VACCINATION',
  'POSTNATAL',
  'OTHER',
]);

export const appointmentStatusSchema = z.enum([
  'SCHEDULED',
  'COMPLETED',
  'MISSED',
  'CANCELLED',
  'RESCHEDULED',
]);

export const appointmentSchema = z.object({
  id: z.string(),
  motherProfileId: z.string(),
  pregnancyId: z.string().nullable().optional(),
  type: appointmentTypeSchema,
  status: appointmentStatusSchema,
  scheduledAt: z.string(),
  facilityName: z.string(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const appointmentListSchema = z.array(appointmentSchema);

export const createAppointmentFormSchema = z.object({
  type: appointmentTypeSchema,
  scheduledAt: z.string().min(1, 'Please choose a date and time.'),
  facilityName: z.string().min(1, 'Please enter a facility name.'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentFormSchema>;
