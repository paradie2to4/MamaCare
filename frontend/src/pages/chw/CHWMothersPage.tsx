import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useAssignedMothers } from '../../hooks/api/useChw';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export function CHWMothersPage() {
  const { t } = useTranslation('chw');
  const { data: mothers, isLoading, isError, refetch } = useAssignedMothers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">{t('mothers.title')}</h1>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && mothers && mothers.length === 0 && (
        <EmptyState icon={<Users className="h-6 w-6" />} title={t('mothers.empty')} />
      )}

      <div className="space-y-3">
        {mothers?.map((mother) => {
          const activePregnancy = mother.pregnancies[0];
          return (
            <Card key={mother.id}>
              <CardContent className="space-y-2 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {mother.user.firstName} {mother.user.lastName}
                  </CardTitle>
                  {mother.followUps.length > 0 ? (
                    <Badge variant="destructive">{t('dashboard.followUpNeeded')}</Badge>
                  ) : (
                    <Badge variant="success">{t('dashboard.onTrack')}</Badge>
                  )}
                </div>
                {mother.user.phone && <p className="text-sm text-muted-foreground">{mother.user.phone}</p>}
                {activePregnancy && (
                  <p className="text-sm text-muted-foreground">
                    {activePregnancy.status === 'ACTIVE' ? 'Active pregnancy' : activePregnancy.status}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
