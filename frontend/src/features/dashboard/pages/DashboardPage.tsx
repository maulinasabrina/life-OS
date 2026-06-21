import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getCurrentUserProfile } from '@/features/dashboard/services/userService';
import type { UserProfile } from '@/shared/types/user';

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentUserProfile()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        // Profile may not exist yet right after signup (trigger race),
        // or the backend may be unreachable. Either way, fall back to
        // the auth-provided email below rather than blocking the page.
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName =
    profile?.full_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-(--color-ink) md:text-3xl">
          {isLoading ? 'Welcome' : `Welcome, ${displayName}`}
        </h1>
        <p className="mt-1 text-(--color-ink-soft)">
          Your dashboard is ready. Widgets for tasks, habits, and journal
          entries will appear here as each module ships.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--color-border) bg-(--color-paper-raised) px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-sage-soft)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-sage)" aria-hidden="true">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        </div>
        <p className="max-w-sm text-sm text-(--color-ink-soft)">
          This space becomes your custom dashboard once the widget builder
          ships in a later phase. For now, use the sidebar to explore what's
          coming.
        </p>
      </div>
    </div>
  );
}
