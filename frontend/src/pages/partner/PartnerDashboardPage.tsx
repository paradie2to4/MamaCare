import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { HeartHandshake, Sparkles } from 'lucide-react';
import { usePartnerDashboard, useAcceptPartnerInvite } from '../../hooks/api/usePartners';
import { Card, CardContent, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export function PartnerDashboardPage() {
  const { t } = useTranslation('partner');
  const { t: tAppointments } = useTranslation('appointments');
  const { data, isLoading, isError, refetch } = usePartnerDashboard();
  const acceptInvite = useAcceptPartnerInvite();

  const waysToHelp = t('waysToHelp.items', { returnObjects: true }) as string[];

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  async function handleAccept() {
    try {
      await acceptInvite.mutateAsync();
      toast.success(t('pending.accept'));
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">
        {data.mother ? t('title', { name: `${data.mother.firstName} ${data.mother.lastName}` }) : t('none.title')}
      </h1>

      {data.status === 'NONE' && (
        <EmptyState icon={<HeartHandshake className="h-6 w-6" />} title={t('none.title')} description={t('none.description')} />
      )}

      {data.status === 'PENDING' && data.mother && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-3 pt-5">
            <CardTitle className="text-base">{t('pending.title')}</CardTitle>
            <CardDescription>
              {t('pending.description', { name: `${data.mother.firstName} ${data.mother.lastName}` })}
            </CardDescription>
            <Button onClick={handleAccept} disabled={acceptInvite.isPending}>
              {t('pending.accept')}
            </Button>
          </CardContent>
        </Card>
      )}

      {data.status === 'ACTIVE' && (
        <>
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('upcoming.title')}
            </h2>
            <Card>
              <CardContent className="pt-5">
                {data.nextAppointment ? (
                  <div>
                    <CardTitle className="text-base">{tAppointments(`type.${data.nextAppointment.type}`)}</CardTitle>
                    <CardDescription>
                      {new Date(data.nextAppointment.scheduledAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {' · '}
                      {data.nextAppointment.facilityName}
                    </CardDescription>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('upcoming.empty')}</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('waysToHelp.title')}
            </h2>
            <Card>
              <CardContent className="space-y-2 pt-5">
                {waysToHelp.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4" />
                    {item}
                  </label>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardContent className="flex items-center gap-3 pt-5">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardDescription>{t('learn.cta')}</CardDescription>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
