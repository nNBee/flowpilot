import fp from 'fastify-plugin';
import { createDatabase } from '@flowpilot/db';

export function databasePlugin(connectionString: string) {
  return fp(async (app) => {
    const { db, pool } = createDatabase(connectionString);

    pool.on('error', (error) => {
      app.log.error(error, 'Unexpected PostgreSQL pool error');
    });

    app.decorate('db', db);

    app.addHook('onClose', async () => {
      await pool.end();
    });
  });
}
