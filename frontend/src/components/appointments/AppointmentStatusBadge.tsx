import { useTranslation } from 'react-i18next';
import { CalendarClock, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { AppointmentStatus } from '../../types';

const CONFIG: Record<
  AppointmentStatus,
  { variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline'; icon: typeof CalendarClock }
> = {
  SCHEDULED: { variant: 'default', icon: CalendarClock },
  COMPLETED: { variant: 'success', icon: CheckCircle2 },
  MISSED: { variant: 'warning', icon: AlertCircle },
  CANCELLED: { variant: 'destructive', icon: XCircle },
  RESCHEDULED: { variant: 'outline', icon: RotateCcw },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useTranslation('appointments');
  const { variant, icon: Icon } = CONFIG[status];

  return (
    <Badge variant={variant}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(`status.${status}`)}
    </Badge>
  );
}
