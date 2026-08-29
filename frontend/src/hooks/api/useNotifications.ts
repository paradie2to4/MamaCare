import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../../lib/api/notifications.api';
import { notificationKeys } from '../../lib/query/keys';

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => notificationsApi.fetchNotifications({ unreadOnly }),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: notificationsApi.fetchUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
