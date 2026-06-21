import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import ws from 'ws';

/**
 * Server-side Supabase client using the service role key.
 * This bypasses Row Level Security entirely, so every query built with
 * this client MUST manually scope by the authenticated user's id
 * (req.user.id from auth.middleware.ts). Never expose this client or
 * its key to the frontend.
 */
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws as any,
    },
  }
);
