import Fastify, { type FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import { databasePlugin } from './plugins/database.js';
import supabasePlugin, {
  type SupabasePluginOptions,
} from './plugins/supabase.js';
import authPlugin from './plugins/auth.js';
import type { Config } from './config.js';
import membershipContextPlugin from './plugins/membership-context.js';
import { routes } from './routes/index.js';
type BuildAppOptions = {
  config: Config;
  databasePlugin?: FastifyPluginAsync;
  supabasePlugin?: FastifyPluginAsync<SupabasePluginOptions>;
};

export function buildApp({
  config,
  databasePlugin: databasePluginOverride,
  supabasePlugin: supabasePluginOverride,
}: BuildAppOptions) {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePluginOverride ?? databasePlugin(config.DATABASE_URL));
  app.register(supabasePluginOverride ?? supabasePlugin, {
    config,
  });
  app.register(authPlugin);
  app.register(membershipContextPlugin);

  app.register(routes);

  app.get('/health', async () => {
    return {
      status: 'ok',
    };
  });

  app.get('/ready', async () => {
    await app.db.execute(sql`select 1`);

    return {
      status: 'ready',
    };
  });

  return app;
}
