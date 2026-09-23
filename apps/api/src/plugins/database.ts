import fp from 'fastify-plugin';
import { createDatabase } from '@flowpilot/db';
import { config } from '../config.js';

export default fp(async (app) => {
  const { db, pool } = createDatabase(config.DATABASE_URL!);
  app.decorate('db', db);
  app.addHook('onClose', async () => {
    await pool.end();
  });
});
