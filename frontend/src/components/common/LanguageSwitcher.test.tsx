import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../../i18n/i18n';
import { renderWithProviders } from '../../test/test-utils';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(() => {
    i18n.changeLanguage('en');
  });

  it('switches rendered text from English to Kinyarwanda', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kinyarwanda' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Kinyarwanda' }));

    expect(await screen.findByRole('button', { name: 'Icyongereza' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ikinyarwanda' })).toBeInTheDocument();
  });
});
