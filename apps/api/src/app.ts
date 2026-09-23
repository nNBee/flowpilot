import Fastify from 'fastify';
import databasePlugin from './plugins/database.js';
import { sql } from 'drizzle-orm';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(databasePlugin);

  app.get('/health', async () => {
    app.db;
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
