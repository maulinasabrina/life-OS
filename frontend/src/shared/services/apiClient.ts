import { supabase } from '@/shared/services/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'Missing VITE_API_BASE_URL environment variable. Check your .env file against .env.example.'
  );
}

/**
 * Fetch wrapper that attaches the current Supabase session's access token
 * as a Bearer header. Throws if there's no active session or the request
 * fails, so callers can handle errors with try/catch.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('No active session. Please sign in again.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}
