import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCurrentPregnancy } from '../../hooks/api/useMothers';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const TOTAL_WEEKS = 40;

function trimesterForWeek(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function JourneyPage() {
  const { t } = useTranslation('journey');
  const { data: pregnancy, isLoading } = useCurrentPregnancy();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!pregnancy) {
    return (
      <EmptyState
        title={t('noPregnancy.title')}
        description={t('noPregnancy.description')}
        action={
          <Button asChild size="sm">
            <Link to="/onboarding">{t('noPregnancy.cta')}</Link>
          </Button>
        }
      />
    );
  }

  const week = Math.min(pregnancy.currentWeek, TOTAL_WEEKS);
  const currentTrimester = trimesterForWeek(week);
  const progressPercent = Math.round((week / TOTAL_WEEKS) * 100);

  const trimesters: Array<{ id: 1 | 2 | 3; labelKey: 'first' | 'second' | 'third' }> = [
    { id: 1, labelKey: 'first' },
    { id: 2, labelKey: 'second' },
    { id: 3, labelKey: 'third' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('dueDate')}: {new Date(pregnancy.eddDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <Progress value={progressPercent} aria-label={t('title')} />
          <ol className="space-y-3">
            {trimesters.map((trimester) => {
              const isCurrent = trimester.id === currentTrimester;
              const isPast = trimester.id < currentTrimester;
              return (
                <li key={trimester.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      isPast && 'bg-success text-success-foreground',
                      isCurrent && 'bg-primary text-primary-foreground',
                      !isPast && !isCurrent && 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {isPast ? '✓' : trimester.id}
                  </span>
                  <span className={cn('text-sm', isCurrent && 'font-semibold text-foreground')}>
                    {t(`trimester.${trimester.labelKey}`)}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-normal text-primary">— {t('youAreHere')}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
