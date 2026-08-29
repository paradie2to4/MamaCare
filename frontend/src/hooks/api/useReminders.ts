import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as remindersApi from '../../lib/api/reminders.api';
import { reminderKeys } from '../../lib/query/keys';
import type { ReminderStatus } from '../../types';

export function useReminders(status?: ReminderStatus) {
  return useQuery({
    queryKey: reminderKeys.list(status),
    queryFn: () => remindersApi.fetchReminders(status),
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.dismissReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}
