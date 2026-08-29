import { apiClient, unwrap } from './client';
import {
  motherProfileSchema,
  pregnancySchema,
  type CreatePregnancyFormValues,
  type UpdateMotherProfileFormValues,
} from '../schemas/mothers.schema';
import { z } from 'zod';

export async function fetchMyProfile() {
  const response = await apiClient.get('/mothers/me/profile');
  return motherProfileSchema.nullable().parse(unwrap(response));
}

export async function updateMyProfile(values: UpdateMotherProfileFormValues) {
  const response = await apiClient.patch('/mothers/me/profile', values);
  return motherProfileSchema.parse(unwrap(response));
}

export async function fetchCurrentPregnancy() {
  const response = await apiClient.get('/mothers/me/pregnancies/current');
  return pregnancySchema.nullable().parse(unwrap(response));
}

export async function fetchPregnancies() {
  const response = await apiClient.get('/mothers/me/pregnancies');
  return z.array(pregnancySchema).parse(unwrap(response));
}

export async function createPregnancy(values: CreatePregnancyFormValues) {
  const response = await apiClient.post('/mothers/me/pregnancies', values);
  return pregnancySchema.parse(unwrap(response));
}
