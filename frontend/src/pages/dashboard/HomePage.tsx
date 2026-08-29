import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, BookOpen, CalendarClock, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrentPregnancy } from '../../hooks/api/useMothers';
import { useAppointments } from '../../hooks/api/useAppointments';
import { useDismissReminder, useReminders } from '../../hooks/api/useReminders';
import { useEducationArticles } from '../../hooks/api/useEducation';
import { Card, CardContent, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';

function useGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function HomePage() {
  const { t } = useTranslation('dashboard');
  const { t: tAppointments } = useTranslation('appointments');
  const { user } = useAuth();
  const greetingKey = useGreetingKey();

  const { data: pregnancy, isLoading: pregnancyLoading } = useCurrentPregnancy();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments('SCHEDULED');
  const { data: reminders, isLoading: remindersLoading } = useReminders('PENDING');
  const { data: articles } = useEducationArticles();
  const dismissReminder = useDismissReminder();

  const nextAppointment = appointments?.[0];
  const featuredArticle = articles?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary">
          {t(`greeting.${greetingKey}`, { name: user?.firstName ?? '' })}
        </h1>
        {pregnancy && <p className="text-sm text-muted-foreground">{t('weekLabel', { week: pregnancy.currentWeek })}</p>}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sections.nextAppointment')}
        </h2>
        <Card>
          <CardContent className="pt-5">
            {appointmentsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : nextAppointment ? (
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base">{tAppointments(`type.${nextAppointment.type}`)}</CardTitle>
                  <CardDescription>
                    {new Date(nextAppointment.scheduledAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {' · '}
                    {nextAppointment.facilityName}
                  </CardDescription>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('sections.noUpcomingAppointment')}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sections.todaysReminders')}
        </h2>
        <Card>
          <CardContent className="space-y-3 pt-5">
            {remindersLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : reminders && reminders.length > 0 ? (
              reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissReminder.mutate(reminder.id)}
                    disabled={dismissReminder.isPending}
                  >
                    {t('reminder.dismiss')}
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t('sections.noReminders')}</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sections.learnThisWeek')}
        </h2>
        {featuredArticle ? (
          <Link to={`/app/learn/${featuredArticle.slug}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-3 pt-5">
                <BookOpen className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base">{featuredArticle.titleEnglish}</CardTitle>
                  <CardDescription>{featuredArticle.summaryEnglish}</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <EmptyState title={t('sections.noReminders')} />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sections.careTeam')}
        </h2>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Stethoscope className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t('sections.careTeamPlaceholder')}</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-destructive" aria-hidden="true" />
              <CardTitle className="text-base text-destructive">{t('sections.getHelp')}</CardTitle>
            </div>
            <Button asChild variant="destructive" size="sm">
              <Link to="/app/learn?category=DANGER_SIGNS">{t('actions.learnMore', { ns: 'common' })}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {!pregnancyLoading && !pregnancy && (
        <EmptyState
          title={t('sections.noUpcomingAppointment')}
          description={t('sections.careTeamPlaceholder')}
        />
      )}
    </div>
  );
}
