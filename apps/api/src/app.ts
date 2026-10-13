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
import {
  appErrorHandler,
  createApiErrorResponse,
} from './errors/app-error.js';

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

  app.setErrorHandler(appErrorHandler);
  app.setNotFoundHandler((_request, reply) => {
    return reply
      .code(404)
      .send(createApiErrorResponse('route_not_found', 'Route not found.'));
  });

  app.register(databasePluginOverride ?? databasePlugin(config.DATABASE_URL));
  app.register(supabasePluginOverride ?? supabasePlugin, {
    config,
  });
  app.register(authPlugin);
  app.register(membershipContextPlugin);

  app.register(routes, {
    webAppUrl: config.WEB_APP_URL,
  });

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
