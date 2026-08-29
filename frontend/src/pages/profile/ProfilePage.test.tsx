import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/test-utils';
import { mockUser } from '../../test/msw/handlers';
import { ProfilePage } from './ProfilePage';

const API_URL = 'http://localhost:3000/api/v1';

function mockAuthenticatedMother() {
  server.use(
    http.post(`${API_URL}/auth/refresh`, () =>
      HttpResponse.json({ data: { user: mockUser, accessToken: 'fake-access-token' } }),
    ),
  );
}

describe('ProfilePage', () => {
  it('shows an invite form when the mother has no partner link', async () => {
    mockAuthenticatedMother();
    server.use(http.get(`${API_URL}/partners/my-link`, () => HttpResponse.json({ data: null })));

    renderWithProviders(<ProfilePage />);

    expect(await screen.findByLabelText("Partner's email address")).toBeInTheDocument();
  });

  it('submits an invite and shows the pending state', async () => {
    mockAuthenticatedMother();
    server.use(http.get(`${API_URL}/partners/my-link`, () => HttpResponse.json({ data: null })));

    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    const emailInput = await screen.findByLabelText("Partner's email address");

    server.use(
      http.post(`${API_URL}/partners/invite`, () =>
        HttpResponse.json({
          data: {
            id: 'link-1',
            status: 'PENDING',
            invitedAt: new Date().toISOString(),
            partner: { firstName: 'Eric', lastName: 'Habimana', email: 'partner@example.com' },
          },
        }),
      ),
      http.get(`${API_URL}/partners/my-link`, () =>
        HttpResponse.json({
          data: {
            id: 'link-1',
            status: 'PENDING',
            invitedAt: new Date().toISOString(),
            partner: { firstName: 'Eric', lastName: 'Habimana', email: 'partner@example.com' },
          },
        }),
      ),
    );

    await user.type(emailInput, 'partner@example.com');
    await user.click(screen.getByRole('button', { name: 'Send invite' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove partner' })).toBeInTheDocument());
  });

  it('shows a revoke button when a partner link already exists', async () => {
    mockAuthenticatedMother();
    server.use(
      http.get(`${API_URL}/partners/my-link`, () =>
        HttpResponse.json({
          data: {
            id: 'link-1',
            status: 'ACTIVE',
            invitedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            partner: { firstName: 'Eric', lastName: 'Habimana', email: 'partner@example.com' },
          },
        }),
      ),
    );

    renderWithProviders(<ProfilePage />);

    expect(await screen.findByRole('button', { name: 'Remove partner' })).toBeInTheDocument();
  });
});
