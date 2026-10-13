import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { requireBusinessMembership } from './require-business-membership.js';
import { appErrorHandler } from '../errors/app-error.js';

describe('requireBusinessMembership', () => {
  it('returns 401 when the request is unauthenticated', async () => {
    const select = vi.fn();
    const app = Fastify();

    app.setErrorHandler(appErrorHandler);
    app.decorate('db', { select } as never);
    app.decorateRequest('user', null);
    app.decorateRequest('membership', null);

    app.get(
      '/business/:businessId/test',
      { preHandler: requireBusinessMembership },
      async () => ({ status: 'ok' }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/business/22222222-2222-4222-8222-222222222222/test',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'unauthorized',
        message: 'Authentication is required.',
      },
    });
    expect(select).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 for malformed businessId before querying the database', async () => {
    const select = vi.fn();

    const app = Fastify();

    app.setErrorHandler(appErrorHandler);

    app.decorate('db', {
      select,
    } as never);

    app.decorateRequest('user', null);
    app.decorateRequest('membership', null);

    app.addHook('preHandler', async (request) => {
      request.user = {
        id: '44444444-4444-4444-8444-444444444444',
      } as never;
    });

    app.get(
      '/business/:businessId/test',
      {
        preHandler: requireBusinessMembership,
      },
      async () => {
        return {
          status: 'ok',
        };
      },
    );

    const response = await app.inject({
      method: 'GET',
      url: '/business/not-a-uuid/test',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'invalid_request',
        message: 'Invalid request.',
      },
    });

    expect(select).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the user is not a business member', async () => {
    const limit = vi.fn().mockResolvedValue([]);
    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit }),
      }),
    });

    const app = Fastify();

    app.setErrorHandler(appErrorHandler);
    app.decorate('db', { select } as never);
    app.decorateRequest('user', null);
    app.decorateRequest('membership', null);
    app.addHook('preHandler', async (request) => {
      request.user = {
        id: '44444444-4444-4444-8444-444444444444',
      } as never;
    });

    app.get(
      '/business/:businessId/test',
      { preHandler: requireBusinessMembership },
      async () => ({ status: 'ok' }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/business/22222222-2222-4222-8222-222222222222/test',
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: 'business_membership_required',
        message: 'Business membership is required.',
      },
    });
    expect(select).toHaveBeenCalledTimes(1);

    await app.close();
  });
});
