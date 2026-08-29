import { useTranslation } from 'react-i18next';
import { Bell, CalendarClock, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../../hooks/api/useNotifications';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../lib/utils';
import type { NotificationType } from '../../types';

const CATEGORY_ICON: Record<NotificationType, typeof Bell> = {
  APPOINTMENT: CalendarClock,
  REMINDER: Bell,
  FOLLOW_UP: ClipboardList,
  EDUCATION: BookOpen,
  SYSTEM: Settings,
};

export function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>
        {notifications && notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            {t('markAllRead')}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && notifications && notifications.length === 0 && (
        <EmptyState icon={<Bell className="h-6 w-6" />} title={t('empty')} />
      )}

      <div className="space-y-2">
        {notifications?.map((notification) => {
          const Icon = CATEGORY_ICON[notification.type];
          return (
            <Card
              key={notification.id}
              className={cn(!notification.read && 'border-primary/40 bg-primary/5')}
            >
              <CardContent className="flex items-start gap-3 pt-5">
                <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    <Badge variant="outline">{t(`category.${notification.type}`)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                    {t('markAsRead', { ns: 'common' })}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
