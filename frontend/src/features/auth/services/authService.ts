import { supabase } from '@/shared/services/supabaseClient';
import type { AuthError, Session } from '@supabase/supabase-js';

export interface AuthResult {
  session: Session | null;
  error: AuthError | null;
}

/**
 * Signs up a new user with email/password.
 * The matching public.users profile row is created automatically
 * via a Postgres trigger on auth.users (see database/sql/users_trigger.sql).
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { session: data.session, error };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { session: data.session, error };
}

/**
 * Redirects the browser to Google's OAuth consent screen.
 * Supabase handles the callback and redirects back to redirectTo.
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  return { error };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
