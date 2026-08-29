import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as mothersApi from '../../lib/api/mothers.api';
import { motherKeys } from '../../lib/query/keys';
import type { CreatePregnancyFormValues, UpdateMotherProfileFormValues } from '../../lib/schemas/mothers.schema';

export function useMotherProfile(enabled = true) {
  return useQuery({
    queryKey: motherKeys.profile,
    queryFn: mothersApi.fetchMyProfile,
    enabled,
  });
}

export function useUpdateMotherProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: UpdateMotherProfileFormValues) => mothersApi.updateMyProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motherKeys.profile });
    },
  });
}

export function useCurrentPregnancy() {
  return useQuery({
    queryKey: motherKeys.currentPregnancy,
    queryFn: mothersApi.fetchCurrentPregnancy,
  });
}

export function usePregnancies() {
  return useQuery({
    queryKey: motherKeys.pregnancies,
    queryFn: mothersApi.fetchPregnancies,
  });
}

export function useCreatePregnancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreatePregnancyFormValues) => mothersApi.createPregnancy(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motherKeys.currentPregnancy });
      queryClient.invalidateQueries({ queryKey: motherKeys.pregnancies });
    },
  });
}
