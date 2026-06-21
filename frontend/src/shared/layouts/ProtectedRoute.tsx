import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Blocks rendering of authenticated routes until the initial session
 * check resolves (avoids a login-flash on refresh), then redirects
 * unauthenticated users to /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-(--color-paper)">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-(--color-sage) border-t-transparent"
          aria-label="Loading"
          role="status"
        />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
