import Fastify, { type FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import { databasePlugin } from './plugins/database.js';
import type { Config } from './config.js';

type BuildAppOptions = {
  config: Config;
  databasePlugin?: FastifyPluginAsync;
};

export function buildApp({
  config,
  databasePlugin: databasePluginOverride,
}: BuildAppOptions) {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePluginOverride ?? databasePlugin(config.DATABASE_URL));

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
