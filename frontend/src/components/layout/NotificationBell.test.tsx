import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/test-utils';
import { NotificationBell } from './NotificationBell';

const API_URL = 'http://localhost:3000/api/v1';

describe('NotificationBell', () => {
  it('hides the badge when there are no unread notifications', async () => {
    server.use(http.get(`${API_URL}/notifications/unread-count`, () => HttpResponse.json({ data: { count: 0 } })));

    renderWithProviders(<NotificationBell />);

    await waitFor(() => expect(screen.getByLabelText('Notifications')).toBeInTheDocument());
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('shows the unread count badge when there are unread notifications', async () => {
    server.use(http.get(`${API_URL}/notifications/unread-count`, () => HttpResponse.json({ data: { count: 5 } })));

    renderWithProviders(<NotificationBell />);

    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications, 5 unread')).toBeInTheDocument();
  });

  it('caps the displayed badge at "9+" for large counts', async () => {
    server.use(http.get(`${API_URL}/notifications/unread-count`, () => HttpResponse.json({ data: { count: 42 } })));

    renderWithProviders(<NotificationBell />);

    expect(await screen.findByText('9+')).toBeInTheDocument();
  });
});
