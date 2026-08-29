import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { COMING_SOON_ITEMS, getNavItemsForRole } from './navItems';

export function Sidebar() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const mainItems = getNavItemsForRole(user?.role);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-8 px-2 text-lg font-semibold text-secondary">{t('appName')}</div>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
        {mainItems.map(({ to, end, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60',
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {t(labelKey)}
          </NavLink>
        ))}

        <div className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('status.comingSoon')}
        </div>
        {COMING_SOON_ITEMS.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground/70"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
