import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Centered card layout for unauthenticated auth screens (login, signup).
 * Distinct from AppLayout, which wraps authenticated pages with the sidebar.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-(--color-paper) px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <span className="font-(family-name:--font-display) text-xl font-semibold tracking-tight text-(--color-ink)">
          Life OS
        </span>
        <div className="w-full rounded-2xl border border-(--color-border) bg-(--color-paper-raised) p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
