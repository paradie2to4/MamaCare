import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as followUpsApi from '../../lib/api/follow-ups.api';
import { chwKeys, followUpKeys } from '../../lib/query/keys';
import type { CreateFollowUpFormValues } from '../../lib/schemas/follow-ups.schema';
import type { FollowUpStatus } from '../../types';

export function useMyFollowUps(status?: FollowUpStatus) {
  return useQuery({
    queryKey: followUpKeys.mine(status),
    queryFn: () => followUpsApi.fetchMyFollowUps(status),
  });
}

export function useMotherFollowUps() {
  return useQuery({
    queryKey: followUpKeys.my,
    queryFn: followUpsApi.fetchMotherFollowUps,
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateFollowUpFormValues) => followUpsApi.createFollowUp(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: chwKeys.summary });
      queryClient.invalidateQueries({ queryKey: chwKeys.mothers });
    },
  });
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => followUpsApi.completeFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: chwKeys.summary });
      queryClient.invalidateQueries({ queryKey: chwKeys.mothers });
    },
  });
}
