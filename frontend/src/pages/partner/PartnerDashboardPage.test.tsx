import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/test-utils';
import { PartnerDashboardPage } from './PartnerDashboardPage';

const API_URL = 'http://localhost:3000/api/v1';

describe('PartnerDashboardPage', () => {
  it('renders the empty state when there is no link (NONE)', async () => {
    server.use(
      http.get(`${API_URL}/partners/dashboard`, () =>
        HttpResponse.json({ data: { status: 'NONE', mother: null, nextAppointment: null } }),
      ),
    );

    renderWithProviders(<PartnerDashboardPage />);

    expect(await screen.findAllByText("You're not connected to a mother yet")).toHaveLength(2);
    expect(
      screen.getByText("Ask the mother you're supporting to invite you from her Profile page using this account's email address."),
    ).toBeInTheDocument();
  });

  it('renders an accept card when the link is PENDING', async () => {
    server.use(
      http.get(`${API_URL}/partners/dashboard`, () =>
        HttpResponse.json({
          data: { status: 'PENDING', mother: { firstName: 'Grace', lastName: 'Uwase' }, nextAppointment: null },
        }),
      ),
    );

    renderWithProviders(<PartnerDashboardPage />);

    expect(await screen.findByText('You have a pending invite')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept invite' })).toBeInTheDocument();
  });

  it('renders the next appointment when the link is ACTIVE', async () => {
    server.use(
      http.get(`${API_URL}/partners/dashboard`, () =>
        HttpResponse.json({
          data: {
            status: 'ACTIVE',
            mother: { firstName: 'Grace', lastName: 'Uwase' },
            nextAppointment: {
              type: 'ANC_VISIT',
              scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
              facilityName: 'Kacyiru Health Center',
              status: 'SCHEDULED',
            },
          },
        }),
      ),
    );

    renderWithProviders(<PartnerDashboardPage />);

    expect(await screen.findByText('Kacyiru Health Center', { exact: false })).toBeInTheDocument();
  });
});
