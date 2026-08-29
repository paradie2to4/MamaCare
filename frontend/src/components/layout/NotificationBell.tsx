import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadNotificationCount } from '../../hooks/api/useNotifications';
import { cn } from '../../lib/utils';

export function NotificationBell() {
  const { data } = useUnreadNotificationCount();
  const count = data?.count ?? 0;

  return (
    <Link
      to="/app/notifications"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          className={cn(
            'absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1',
            'bg-primary text-[10px] font-semibold text-primary-foreground',
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
