import type { Database } from '@flowpilot/db';
import type { User } from '@supabase/supabase-js';
import type { SupabaseAdminClient } from '../lib/supabase-admin.ts';
import type { membership } from '@flowpilot/db';

type Membership = typeof membership.$inferSelect;

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    supabase: SupabaseAdminClient;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
    membership?: Membership | null;
  }
}
