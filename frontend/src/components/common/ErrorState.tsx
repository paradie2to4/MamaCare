import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <p className="text-sm text-destructive">{message ?? t('status.somethingWentWrong')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('actions.tryAgain')}
        </Button>
      )}
    </div>
  );
}
