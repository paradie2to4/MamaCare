import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/test-utils';
import { AppointmentsPage } from './AppointmentsPage';

const API_URL = 'http://localhost:3000/api/v1';

describe('AppointmentsPage', () => {
  it('renders a status badge for each appointment', async () => {
    renderWithProviders(<AppointmentsPage />);

    expect(await screen.findByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
  });

  it('shows an empty state when there are no appointments', async () => {
    server.use(http.get(`${API_URL}/appointments`, () => HttpResponse.json({ data: [] })));

    renderWithProviders(<AppointmentsPage />);

    expect(await screen.findByText('No appointments yet')).toBeInTheDocument();
  });
});
