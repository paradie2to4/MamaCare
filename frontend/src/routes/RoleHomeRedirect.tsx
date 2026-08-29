import { useAuth } from '../context/AuthContext';
import { HomePage } from '../pages/dashboard/HomePage';
import { PartnerDashboardPage } from '../pages/partner/PartnerDashboardPage';
import { CHWDashboardPage } from '../pages/chw/CHWDashboardPage';

export function RoleHomeRedirect() {
  const { user } = useAuth();

  if (user?.role === 'PARTNER') {
    return <PartnerDashboardPage />;
  }
  if (user?.role === 'CHW') {
    return <CHWDashboardPage />;
  }
  return <HomePage />;
}
