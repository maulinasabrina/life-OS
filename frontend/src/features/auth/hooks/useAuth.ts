import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/context/AuthContext';

/**
 * Access the current auth session/user/loading state.
 * Must be used within an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
