import { createClient } from '@supabase/supabase-js';
import type { Config } from '../config.js';

export function createSupabaseAdminClient(config: Config) {
  return createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
