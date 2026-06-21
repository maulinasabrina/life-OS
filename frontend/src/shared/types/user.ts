/**
 * Mirrors the public.users table (see Database Design doc).
 * This is the app-level user profile, distinct from Supabase's
 * internal auth.users record.
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
