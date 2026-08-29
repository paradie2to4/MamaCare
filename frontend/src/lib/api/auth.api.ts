import { apiClient, unwrap } from './client';
import { authResponseSchema, userSchema } from '../schemas/auth.schema';
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schema';

export async function login(values: LoginFormValues) {
  const response = await apiClient.post('/auth/login', values);
  return authResponseSchema.parse(unwrap(response));
}

export async function register(values: RegisterFormValues) {
  const response = await apiClient.post('/auth/register', values);
  return authResponseSchema.parse(unwrap(response));
}

export async function refresh() {
  const response = await apiClient.post('/auth/refresh');
  return authResponseSchema.parse(unwrap(response));
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function fetchMe() {
  const response = await apiClient.get('/auth/me');
  return userSchema.parse(unwrap(response));
}
