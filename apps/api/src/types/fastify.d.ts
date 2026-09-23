import type { Database } from '@flowpilot/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}
