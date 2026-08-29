import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, Users, BarChart3, ShieldCheck, Globe2, BellRing } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '../components/ui/card';

const FEATURE_ICONS = [Globe2, HeartHandshake, BellRing, Users, BarChart3, ShieldCheck];

export function LandingPage() {
  const { t } = useTranslation('landing');
  const steps = t('howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const features = t('features.items', { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-16 text-center md:pt-24">
        <h1 className="text-3xl font-bold tracking-tight text-secondary md:text-5xl">{t('hero.title')}</h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">{t('hero.subtitle')}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/register">{t('hero.primaryCta')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#how-it-works">{t('hero.secondaryCta')}</a>
          </Button>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-4xl px-4">
        <h2 className="mb-8 text-center text-2xl font-semibold text-secondary">{t('howItWorks.title')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="pt-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <CardTitle className="mb-1 text-base">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {(['mothers', 'families', 'chw', 'officers'] as const).map((key) => (
            <Card key={key}>
              <CardContent className="pt-5">
                <CardTitle className="mb-1 text-base">{t(`audiences.${key}.title`)}</CardTitle>
                <CardDescription>{t(`audiences.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4">
        <h2 className="mb-8 text-center text-2xl font-semibold text-secondary">{t('features.title')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
            return (
              <li key={feature} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4">
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="pt-5">
            <CardTitle className="mb-1 text-base">{t('privacy.title')}</CardTitle>
            <CardDescription>{t('privacy.description')}</CardDescription>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-semibold text-secondary">{t('cta.title')}</h2>
        <p className="text-muted-foreground">{t('cta.subtitle')}</p>
        <Button asChild size="lg">
          <Link to="/register">{t('cta.button')}</Link>
        </Button>
        <p className="mt-2 max-w-md text-xs text-muted-foreground">{t('disclaimer')}</p>
      </section>
    </div>
  );
}
