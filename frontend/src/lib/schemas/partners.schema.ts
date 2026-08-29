import { z } from 'zod';

export const partnerLinkStatusSchema = z.enum(['PENDING', 'ACTIVE', 'REVOKED']);

export const partnerLinkViewSchema = z.object({
  id: z.string(),
  status: partnerLinkStatusSchema,
  invitedAt: z.string(),
  acceptedAt: z.string().nullable().optional(),
  partner: z.object({ firstName: z.string(), lastName: z.string(), email: z.string() }).optional(),
});

export const nextAppointmentSummarySchema = z.object({
  type: z.string(),
  scheduledAt: z.string(),
  facilityName: z.string(),
  status: z.string(),
});

export const partnerDashboardSchema = z.object({
  status: z.enum(['NONE', 'PENDING', 'ACTIVE']),
  mother: z.object({ firstName: z.string(), lastName: z.string() }).nullable(),
  nextAppointment: nextAppointmentSummarySchema.nullable(),
});

export const invitePartnerFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export type InvitePartnerFormValues = z.infer<typeof invitePartnerFormSchema>;
