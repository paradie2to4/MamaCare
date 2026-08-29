import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export function AppHeader() {
  const { t } = useTranslation('common');
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
      <span className="text-base font-semibold text-secondary md:hidden">{t('appName')}</span>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" aria-label={t('actions.logout')} onClick={() => logout()}>
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
