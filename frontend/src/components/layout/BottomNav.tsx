import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsForRole } from './navItems';

export function BottomNav() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const items = getNavItemsForRole(user?.role);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="flex justify-between px-2 py-1">
        {items.map(({ to, end, icon: Icon, labelKey }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
