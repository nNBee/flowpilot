import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { requireBusinessMembership } from './require-business-membership.js';

describe('requireBusinessMembership', () => {
  it('returns 400 for malformed businessId before querying the database', async () => {
    const select = vi.fn();

    const app = Fastify();

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
      error: 'Invalid request',
    });

    expect(select).not.toHaveBeenCalled();

    await app.close();
  });
});
