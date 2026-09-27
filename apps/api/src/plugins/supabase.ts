import fp from 'fastify-plugin';
import { createSupabaseAdminClient } from '../lib/supabase-admin.js';

import type { Config } from '../config.js';

export interface SupabasePluginOptions {
  config: Config;
}

export default fp<SupabasePluginOptions>(async function supabasePlugin(
  app,
  { config },
) {
  const supabase = createSupabaseAdminClient(config);

  app.decorate('supabase', supabase);
});
