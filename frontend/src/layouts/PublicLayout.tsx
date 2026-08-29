import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

export function PublicLayout() {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="text-lg font-semibold text-secondary">
          {t('appName')}
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground md:px-8">
        {t('footer.disclaimer')}
      </footer>
    </div>
  );
}
