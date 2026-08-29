import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../context/AuthContext';

const LANGUAGES: Array<{ code: 'en' | 'rw'; labelKey: 'language.en' | 'language.rw' }> = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'rw', labelKey: 'language.rw' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation('common');
  const { user } = useAuth();

  const persistLanguage = useMutation({
    mutationFn: (preferredLanguage: string) => apiClient.patch('/users/me', { preferredLanguage }),
  });

  function handleChange(code: 'en' | 'rw') {
    i18n.changeLanguage(code);
    if (user) {
      persistLanguage.mutate(code);
    }
  }

  return (
    <div className={cn('flex items-center gap-1 rounded-full border border-border bg-card p-1', className)}>
      <span className="sr-only">{t('language.label')}</span>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => handleChange(lang.code)}
          aria-pressed={i18n.language === lang.code}
          className={cn(
            'min-h-[36px] rounded-full px-3 text-sm font-medium transition-colors',
            i18n.language === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t(lang.labelKey)}
        </button>
      ))}
    </div>
  );
}
