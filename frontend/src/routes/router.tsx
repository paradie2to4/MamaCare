import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleHomeRedirect } from './RoleHomeRedirect';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OnboardingPage } from '../pages/onboarding/OnboardingPage';
import { JourneyPage } from '../pages/journey/JourneyPage';
import { EducationListPage } from '../pages/education/EducationListPage';
import { EducationDetailPage } from '../pages/education/EducationDetailPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { CHWMothersPage } from '../pages/chw/CHWMothersPage';
import { CHWFollowUpsPage } from '../pages/chw/CHWFollowUpsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ComingSoonPage } from '../pages/comingsoon/ComingSoonPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['MOTHER']} />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
  },
  {
    // Any authenticated app role can reach the shell — role-specific access
    // is enforced per sub-route below, never at this top level, so PARTNER/CHW
    // don't get bounced into a redirect loop trying to reach their own home.
    element: <ProtectedRoute allowedRoles={['MOTHER', 'PARTNER', 'CHW']} />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: <RoleHomeRedirect /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          {
            element: <ProtectedRoute allowedRoles={['MOTHER']} />,
            children: [
              { path: 'journey', element: <JourneyPage /> },
              { path: 'learn', element: <EducationListPage /> },
              { path: 'learn/:slug', element: <EducationDetailPage /> },
              { path: 'appointments', element: <AppointmentsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={['CHW']} />,
            children: [
              { path: 'chw/mothers', element: <CHWMothersPage /> },
              { path: 'chw/follow-ups', element: <CHWFollowUpsPage /> },
            ],
          },
          { path: 'officer', element: <ComingSoonPage /> },
          { path: 'assistant', element: <ComingSoonPage /> },
        ],
      },
    ],
  },
]);
