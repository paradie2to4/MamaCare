import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<div>Mother home</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  it('logs in with valid credentials and redirects to /app', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'grace@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(screen.getByText('Mother home')).toBeInTheDocument());
  });

  it('shows a validation message for an empty password', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(await screen.findByLabelText(/email address/i), 'grace@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
