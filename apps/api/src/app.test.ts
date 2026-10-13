import { describe, expect, it } from 'vitest';
import fp from 'fastify-plugin';

import { buildApp } from './app.js';

const fakeDatabasePlugin = fp(async (app) => {
  app.decorate('db', {} as never);
});
const fakeSupabasePlugin = fp(async (app) => {
  app.decorate('supabase', {
    auth: {
      admin: {},
    },
  } as never);
});

describe('health endpoint', () => {
  it('returns ok', async () => {
    const app = buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
        WEB_APP_URL: 'https://app.example.com',
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

  it('registers the invitation route', async () => {
    const app = await buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
        WEB_APP_URL: 'https://app.example.com',
      },
      databasePlugin: fakeDatabasePlugin,
      supabasePlugin: fakeSupabasePlugin,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/business/not-a-uuid/invitations',
      payload: {
        email: 'test@example.com',
        roleId: '11111111-1111-4111-8111-111111111111',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'unauthorized',
        message: 'Authentication is required.',
      },
    });

    await app.close();
  });

  it('returns the common error contract for malformed JSON', async () => {
    const app = buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
        WEB_APP_URL: 'https://app.example.com',
      },
      databasePlugin: fakeDatabasePlugin,
      supabasePlugin: fakeSupabasePlugin,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/invitations/11111111-1111-4111-8111-111111111111/accept',
      headers: {
        'content-type': 'application/json',
      },
      payload: '{',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'invalid_request',
        message: 'Invalid request.',
      },
    });

    await app.close();
  });

  it('sanitizes unexpected errors', async () => {
    const databaseError = new Error('sensitive database details');

    const failingDatabasePlugin = fp(async (app) => {
      app.decorate('db', {
        execute: async () => {
          throw databaseError;
        },
      } as never);
    });

    const app = buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
        WEB_APP_URL: 'https://app.example.com',
      },
      databasePlugin: failingDatabasePlugin,
      supabasePlugin: fakeSupabasePlugin,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: 'internal_server_error',
        message: 'Something went wrong. Please try again.',
      },
    });
    expect(response.body).not.toContain(databaseError.message);

    await app.close();
  });

  it('returns the common error contract for unknown routes', async () => {
    const app = buildApp({
      config: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: 3000,
        DATABASE_URL: 'postgres://test',
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SECRET_KEY: 'test-secret-key',
        WEB_APP_URL: 'https://app.example.com',
      },
      databasePlugin: fakeDatabasePlugin,
      supabasePlugin: fakeSupabasePlugin,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/does-not-exist',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: 'route_not_found',
        message: 'Route not found.',
      },
    });

    await app.close();
  });
});
