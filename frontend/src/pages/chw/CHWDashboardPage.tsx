import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { useChwSummary, useAssignedMothers } from '../../hooks/api/useChw';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorState } from '../../components/common/ErrorState';

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        <div>
          <p className="text-2xl font-semibold text-secondary">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CHWDashboardPage() {
  const { t } = useTranslation('chw');
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useChwSummary();
  const { data: mothers, isLoading: mothersLoading } = useAssignedMothers();

  if (summaryError) {
    return <ErrorState onRetry={() => refetchSummary()} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">{t('dashboard.title')}</h1>

      {summaryLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SummaryTile icon={Users} label={t('dashboard.totalAssigned')} value={summary?.totalAssigned ?? 0} />
          <SummaryTile icon={CheckCircle2} label={t('dashboard.onTrack')} value={summary?.onTrack ?? 0} />
          <SummaryTile icon={ClipboardList} label={t('dashboard.followUpNeeded')} value={summary?.followUpNeeded ?? 0} />
          <SummaryTile icon={AlertTriangle} label={t('dashboard.priority')} value={summary?.priority ?? 0} />
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('mothers.title')}</h2>
          <Link to="/app/chw/mothers" className="text-sm font-medium text-primary hover:underline">
            {t('mothers.viewDetails')}
          </Link>
        </div>
        {mothersLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-3">
            {mothers?.slice(0, 3).map((mother) => (
              <Card key={mother.id}>
                <CardContent className="flex items-center justify-between pt-5">
                  <p className="font-medium">
                    {mother.user.firstName} {mother.user.lastName}
                  </p>
                  {mother.followUps.length > 0 ? (
                    <span className="text-sm text-destructive">{t('dashboard.followUpNeeded')}</span>
                  ) : (
                    <span className="text-sm text-success">{t('dashboard.onTrack')}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
