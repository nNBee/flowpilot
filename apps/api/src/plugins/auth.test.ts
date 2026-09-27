import Fastify, { type FastifyPluginAsync } from 'fastify';
import { describe, expect, it } from 'vitest';
import fp from 'fastify-plugin';
import authPlugin from './auth.js';

const fakeUser = {
  id: 'user-123',
  email: 'test@example.com',
};

function createFakeSupabasePlugin({
  user = fakeUser,
  error = null,
}: {
  user?: typeof fakeUser | null;
  error?: Error | null;
} = {}): FastifyPluginAsync {
  return fp(async (app) => {
    app.decorate('supabase', {
      auth: {
        getUser: async () => ({
          data: {
            user,
          },
          error,
        }),
      },
    } as never);
  });
}

async function buildTestApp(
  supabasePlugin: FastifyPluginAsync = createFakeSupabasePlugin(),
) {
  const app = Fastify();

  await app.register(supabasePlugin);
  await app.register(authPlugin);

  app.get('/protected-test', async (request) => {
    return {
      userId: request.user?.id ?? null,
    };
  });

  return app;
}

describe('authPlugin', () => {
  it('allows requests without an authorization header', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/protected-test',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      userId: null,
    });

    await app.close();
  });

  it('returns 401 for an invalid bearer token', async () => {
    const app = await buildTestApp(
      createFakeSupabasePlugin({
        user: null,
        error: new Error('Invalid token'),
      }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/protected-test',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
    });

    await app.close();
  });

  it('adds the authenticated user to the request', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/protected-test',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      userId: 'user-123',
    });

    await app.close();
  });
});
