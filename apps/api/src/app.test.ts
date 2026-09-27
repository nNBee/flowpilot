import { describe, expect, it } from 'vitest';
import fp from 'fastify-plugin';

import { buildApp } from './app.js';
import { FastifyPluginAsync } from 'fastify';

describe('health endpoint', () => {
  it('returns ok', async () => {
    const fakeDatabasePlugin = fp(async (app) => {
      app.decorate('db', {} as never);
    });
    const fakeSupabasePlugin: FastifyPluginAsync = async (app) => {
      app.decorate('supabase', {
        auth: {
          admin: {},
        },
      } as never);
    };

    const app = buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
      },
      databasePlugin: fakeDatabasePlugin,
      supabasePlugin: fakeSupabasePlugin,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
    });

    await app.close();
  });
});
