import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file against .env.example.'
  );
}

/**
 * Single shared Supabase client for the frontend.
 * Session persistence and auto token refresh are enabled by default.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
