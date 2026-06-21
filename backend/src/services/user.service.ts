import { supabaseAdmin } from '../configs/supabaseAdmin';
import type { UserProfile } from '../types/user';

/**
 * Fetches the public.users profile row for a given auth user id.
 * Uses the admin client (RLS bypassed), so the caller is responsible
 * for ensuring userId comes from a verified token (see auth.middleware.ts) —
 * never from client-supplied input.
 */
export async function getUserProfileById(
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found, which can legitimately happen if the
    // signup trigger hasn't run yet (race condition right after signup).
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}
