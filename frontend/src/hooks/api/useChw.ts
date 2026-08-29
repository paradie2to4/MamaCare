import { useQuery } from '@tanstack/react-query';
import * as chwApi from '../../lib/api/chw.api';
import { chwKeys } from '../../lib/query/keys';

export function useChwSummary() {
  return useQuery({
    queryKey: chwKeys.summary,
    queryFn: chwApi.fetchChwSummary,
  });
}

export function useAssignedMothers() {
  return useQuery({
    queryKey: chwKeys.mothers,
    queryFn: chwApi.fetchAssignedMothers,
  });
}
