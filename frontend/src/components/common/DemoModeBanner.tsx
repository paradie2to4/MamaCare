import { Sparkles } from 'lucide-react';

/**
 * Only rendered when VITE_ENABLE_MOCKS=true (see main.tsx). Makes it obvious to a
 * reviewer that this deployment is running against mocked data, not a live backend,
 * and tells them exactly which demo accounts to try.
 */
export function DemoModeBanner() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-xs font-medium text-secondary-foreground">
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Demo mode — no live backend, all data is mocked and resets on reload. Log in as{' '}
        <strong>mother@example.com</strong>, <strong>partner@example.com</strong>, or{' '}
        <strong>chw@example.com</strong> (password: <strong>Password123!</strong>).
      </span>
    </div>
  );
}
