import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardList, Home, Route, Sparkles, UserCircle, Users } from 'lucide-react';
import type { Role } from '../../types';

export interface NavItem {
  to: string;
  end?: boolean;
  icon: typeof Home;
  labelKey: string;
}

const MOTHER_ITEMS: NavItem[] = [
  { to: '/app', end: true, icon: Home, labelKey: 'nav.home' },
  { to: '/app/journey', icon: Route, labelKey: 'nav.journey' },
  { to: '/app/learn', icon: BookOpen, labelKey: 'nav.learn' },
  { to: '/app/appointments', icon: CalendarDays, labelKey: 'nav.appointments' },
  { to: '/app/assistant', icon: Sparkles, labelKey: 'nav.assistant' },
  { to: '/app/profile', icon: UserCircle, labelKey: 'nav.profile' },
];

const CHW_ITEMS: NavItem[] = [
  { to: '/app', end: true, icon: Home, labelKey: 'nav.dashboard' },
  { to: '/app/chw/mothers', icon: Users, labelKey: 'nav.mothers' },
  { to: '/app/chw/follow-ups', icon: ClipboardList, labelKey: 'nav.followups' },
  { to: '/app/notifications', icon: Bell, labelKey: 'nav.notifications' },
  { to: '/app/profile', icon: UserCircle, labelKey: 'nav.profile' },
];

const PARTNER_ITEMS: NavItem[] = [
  { to: '/app', end: true, icon: Home, labelKey: 'nav.dashboard' },
  { to: '/app/profile', icon: UserCircle, labelKey: 'nav.profile' },
];

export const COMING_SOON_ITEMS: NavItem[] = [
  { to: '/app/officer', icon: BarChart3, labelKey: 'nav.officer' },
];

export function getNavItemsForRole(role: Role | undefined): NavItem[] {
  if (role === 'CHW') return CHW_ITEMS;
  if (role === 'PARTNER') return PARTNER_ITEMS;
  return MOTHER_ITEMS;
}
