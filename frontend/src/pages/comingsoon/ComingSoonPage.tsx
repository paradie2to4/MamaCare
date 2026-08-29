import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function ComingSoonPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-secondary">{t('comingSoon.title')}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t('comingSoon.description')}</p>
      <Button asChild variant="outline">
        <Link to="/app">{t('nav.home')}</Link>
      </Button>
    </div>
  );
}
