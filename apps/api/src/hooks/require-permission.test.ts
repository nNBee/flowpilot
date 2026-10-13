import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { appErrorHandler } from '../errors/app-error.js';
import { requirePermission } from './require-permission.js';

describe('requirePermission', () => {
  it('returns 403 when membership context is missing', async () => {
    const select = vi.fn();
    const app = Fastify();

    app.setErrorHandler(appErrorHandler);
    app.decorate('db', { select } as never);
    app.decorateRequest('membership', null);

    app.get(
      '/test',
      { preHandler: requirePermission('member.invite') },
      async () => ({ status: 'ok' }),
    );

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: 'forbidden',
        message: 'Permission denied.',
      },
    });
    expect(select).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the role lacks the required permission', async () => {
    const limit = vi.fn().mockResolvedValue([]);
    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ limit }),
        }),
      }),
    });

    const app = Fastify();

    app.setErrorHandler(appErrorHandler);
    app.decorate('db', { select } as never);
    app.decorateRequest('membership', null);
    app.addHook('preHandler', async (request) => {
      request.membership = {
        roleId: '33333333-3333-4333-8333-333333333333',
      } as never;
    });

    app.get(
      '/test',
      { preHandler: requirePermission('member.invite') },
      async () => ({ status: 'ok' }),
    );

    const response = await app.inject({ method: 'GET', url: '/test' });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: 'forbidden',
        message: 'Permission denied.',
      },
    });
    expect(select).toHaveBeenCalledTimes(1);

    await app.close();
  });
});
