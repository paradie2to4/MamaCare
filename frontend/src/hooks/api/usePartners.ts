import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as partnersApi from '../../lib/api/partners.api';
import { partnerKeys } from '../../lib/query/keys';

export function useMyPartnerLink() {
  return useQuery({
    queryKey: partnerKeys.myLink,
    queryFn: partnersApi.fetchMyPartnerLink,
  });
}

export function useInvitePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => partnersApi.invitePartner(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.myLink });
    },
  });
}

export function useRevokePartnerLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnersApi.revokePartnerLink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.myLink });
    },
  });
}

export function usePartnerDashboard() {
  return useQuery({
    queryKey: partnerKeys.dashboard,
    queryFn: partnersApi.fetchPartnerDashboard,
  });
}

export function useAcceptPartnerInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => partnersApi.acceptPartnerInvite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.dashboard });
    },
  });
}
