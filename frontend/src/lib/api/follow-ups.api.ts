import { apiClient, unwrap } from './client';
import { healthFollowUpListSchema, healthFollowUpSchema, type CreateFollowUpFormValues } from '../schemas/follow-ups.schema';
import type { FollowUpStatus } from '../../types';

export async function createFollowUp(values: CreateFollowUpFormValues) {
  const response = await apiClient.post('/follow-ups', values);
  return healthFollowUpSchema.parse(unwrap(response));
}

export async function fetchMyFollowUps(status?: FollowUpStatus) {
  const response = await apiClient.get('/follow-ups/mine', { params: status ? { status } : undefined });
  return healthFollowUpListSchema.parse(unwrap(response));
}

export async function completeFollowUp(id: string) {
  const response = await apiClient.patch(`/follow-ups/${id}/complete`);
  return healthFollowUpSchema.parse(unwrap(response));
}

export async function fetchMotherFollowUps() {
  const response = await apiClient.get('/follow-ups/my');
  return healthFollowUpListSchema.parse(unwrap(response));
}
