import { apiClient, unwrap } from './client';
import {
  partnerDashboardSchema,
  partnerLinkViewSchema,
} from '../schemas/partners.schema';

export async function invitePartner(email: string) {
  const response = await apiClient.post('/partners/invite', { email });
  return partnerLinkViewSchema.parse(unwrap(response));
}

export async function fetchMyPartnerLink() {
  const response = await apiClient.get('/partners/my-link');
  return partnerLinkViewSchema.nullable().parse(unwrap(response));
}

export async function revokePartnerLink() {
  const response = await apiClient.patch('/partners/revoke');
  return partnerLinkViewSchema.parse(unwrap(response));
}

export async function fetchPartnerDashboard() {
  const response = await apiClient.get('/partners/dashboard');
  return partnerDashboardSchema.parse(unwrap(response));
}

export async function acceptPartnerInvite() {
  const response = await apiClient.patch('/partners/accept');
  return partnerLinkViewSchema.parse(unwrap(response));
}
