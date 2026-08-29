import { apiClient, unwrap } from './client';
import { notificationListSchema, unreadCountSchema } from '../schemas/notifications.schema';
import type { NotificationType } from '../../types';

export async function fetchNotifications(params?: { unreadOnly?: boolean; type?: NotificationType }) {
  const response = await apiClient.get('/notifications', { params });
  return notificationListSchema.parse(unwrap(response));
}

export async function fetchUnreadCount() {
  const response = await apiClient.get('/notifications/unread-count');
  return unreadCountSchema.parse(unwrap(response));
}

export async function markNotificationRead(id: string) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
}
