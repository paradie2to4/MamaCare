import { z } from 'zod';

export const roleSchema = z.enum(['MOTHER', 'PARTNER', 'CHW', 'HEALTH_OFFICER', 'ADMIN']);

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  role: roleSchema,
  preferredLanguage: z.string(),
  createdAt: z.string(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export const registerFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
