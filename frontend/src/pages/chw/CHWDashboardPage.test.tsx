import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import { CHWDashboardPage } from './CHWDashboardPage';

describe('CHWDashboardPage', () => {
  it('renders summary tiles from the mocked /chw/summary response', async () => {
    renderWithProviders(<CHWDashboardPage />);

    expect(await screen.findByText('Pregnant mothers')).toBeInTheDocument();
    expect(screen.getByText('On track')).toBeInTheDocument();
    expect(screen.getByText('Follow-up needed')).toBeInTheDocument();
    expect(screen.getByText('Priority follow-up')).toBeInTheDocument();

    // Default MSW handler returns totalAssigned: 3, onTrack: 1, followUpNeeded: 1, priority: 1
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
