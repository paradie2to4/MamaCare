import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../test/msw/server';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const API_URL = 'http://localhost:3000/api/v1';

function renderProtected(initialPath: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route path="/app" element={<div>Mother app</div>} />
            <Route element={<ProtectedRoute allowedRoles={['MOTHER']} />}>
              <Route path="/onboarding" element={<div>Onboarding page</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function userPayload(role: 'MOTHER' | 'PARTNER' | 'CHW') {
  return {
    id: `user-${role}`,
    firstName: 'Test',
    lastName: 'User',
    email: `${role.toLowerCase()}@example.com`,
    phone: null,
    role,
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
  };
}

function mockAuthenticatedAs(role: 'MOTHER' | 'PARTNER' | 'CHW') {
  server.use(
    http.post(`${API_URL}/auth/refresh`, () =>
      HttpResponse.json({ data: { user: userPayload(role), accessToken: 'fake-token' } }),
    ),
  );
}

/** Mirrors the real /app nesting: any app role reaches /app, but /app/journey is MOTHER-only. */
function renderAppShellRouting(initialPath: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route element={<ProtectedRoute allowedRoles={['MOTHER', 'PARTNER', 'CHW']} />}>
              <Route path="/app" element={<div>App home</div>} />
              <Route element={<ProtectedRoute allowedRoles={['MOTHER']} />}>
                <Route path="/app/journey" element={<div>Journey page</div>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to /login', async () => {
    renderProtected('/onboarding');

    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('redirects a user whose role is not allowed away to /app', async () => {
    server.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json({
          data: {
            user: {
              id: 'user-2',
              firstName: 'Eric',
              lastName: 'Habimana',
              email: 'partner@example.com',
              phone: null,
              role: 'PARTNER',
              preferredLanguage: 'en',
              createdAt: new Date().toISOString(),
            },
            accessToken: 'fake-token',
          },
        }),
      ),
    );

    renderProtected('/onboarding');

    expect(await screen.findByText('Mother app')).toBeInTheDocument();
  });

  describe('/app shell nesting (CHW/PARTNER can reach /app, not just MOTHER)', () => {
    it('lets a PARTNER reach /app directly (no redirect loop)', async () => {
      mockAuthenticatedAs('PARTNER');

      renderAppShellRouting('/app');

      expect(await screen.findByText('App home')).toBeInTheDocument();
    });

    it('lets a CHW reach /app directly (no redirect loop)', async () => {
      mockAuthenticatedAs('CHW');

      renderAppShellRouting('/app');

      expect(await screen.findByText('App home')).toBeInTheDocument();
    });

    it('redirects a CHW away from a MOTHER-only sub-route back to /app, not into a loop', async () => {
      mockAuthenticatedAs('CHW');

      renderAppShellRouting('/app/journey');

      expect(await screen.findByText('App home')).toBeInTheDocument();
    });

    it('lets a MOTHER reach the MOTHER-only sub-route', async () => {
      mockAuthenticatedAs('MOTHER');

      renderAppShellRouting('/app/journey');

      expect(await screen.findByText('Journey page')).toBeInTheDocument();
    });
  });
});
