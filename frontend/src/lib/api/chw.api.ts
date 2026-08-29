import { apiClient, unwrap } from './client';
import { assignedMotherListSchema, chwSummarySchema } from '../schemas/chw.schema';

export async function fetchChwSummary() {
  const response = await apiClient.get('/chw/summary');
  return chwSummarySchema.parse(unwrap(response));
}

export async function fetchAssignedMothers() {
  const response = await apiClient.get('/chw/mothers');
  return assignedMotherListSchema.parse(unwrap(response));
}
