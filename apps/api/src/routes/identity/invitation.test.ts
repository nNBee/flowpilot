import Fastify, { type preHandlerHookHandler } from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { invitationRoute } from './invitation.js';

const businessId = '22222222-2222-4222-8222-222222222222';

const roleId = '33333333-3333-4333-8333-333333333333';

const userId = '44444444-4444-4444-8444-444444444444';

const inviterRoleId = '55555555-5555-4555-8555-555555555555';

const fakeInvitationId = '11111111-1111-4111-8111-111111111111';

const unauthorized: preHandlerHookHandler = async (_request, reply) => {
  return reply.code(401).send({
    error: 'Unauthorized',
  });
};

const forbidden: preHandlerHookHandler = async (_request, reply) => {
  return reply.code(403).send({
    error: 'Forbidden',
  });
};

const allowRequest: preHandlerHookHandler = async () => {};

const allowMembership: preHandlerHookHandler = async (request) => {
  request.membership = {
    id: '66666666-6666-4666-8666-666666666666',
    userId,
    businessId,
    roleId: inviterRoleId,
  } as never;
};

const fakeRequireAuth: preHandlerHookHandler = async (request) => {
  request.user = {
    id: userId,
  } as never;
};

type InvitationRouteOptions = Parameters<typeof invitationRoute>[1];

type BuildTestAppOptions = {
  createInvitation: NonNullable<InvitationRouteOptions['createInvitation']>;
  requireAuth?: preHandlerHookHandler;
  requireBusinessMembership?: preHandlerHookHandler;
  requireInvitePermission?: preHandlerHookHandler;
};

async function buildTestApp({
  createInvitation,
  requireAuth = fakeRequireAuth,
  requireBusinessMembership = allowMembership,
  requireInvitePermission = allowRequest,
}: BuildTestAppOptions) {
  const app = Fastify();

  await app.register(invitationRoute, {
    createInvitation,
    requireAuth,
    requireBusinessMembership,
    requireInvitePermission,
  });

  return app;
}

describe('invitationRoute', () => {
  it('creates an invitation', async () => {
    const fakeCreateInvitation = vi.fn().mockResolvedValue({
      ok: true,
      invitation: {
        id: fakeInvitationId,
        businessId,
        email: 'test@example.com',
        roleId,
      },
    });

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(201);

    expect(response.json()).toEqual({
      invitation: {
        id: fakeInvitationId,
        businessId,
        email: 'test@example.com',
        roleId,
      },
    });

    expect(fakeCreateInvitation).toHaveBeenCalledTimes(1);

    expect(fakeCreateInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
        inviterRoleId,
      }),
    );

    await app.close();
  });

  it('returns 401 when authentication fails', async () => {
    const fakeCreateInvitation = vi.fn();

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
      requireAuth: unauthorized,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(fakeCreateInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when business membership is forbidden', async () => {
    const fakeCreateInvitation = vi.fn();

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
      requireBusinessMembership: forbidden,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(fakeCreateInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when invite permission is forbidden', async () => {
    const fakeCreateInvitation = vi.fn();

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
      requireInvitePermission: forbidden,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(fakeCreateInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 for invalid request data', async () => {
    const fakeCreateInvitation = vi.fn();

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'not-an-email',
        roleId: 'not-a-uuid',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(fakeCreateInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when role is invalid', async () => {
    const fakeCreateInvitation = vi.fn().mockResolvedValue({
      ok: false,
      reason: 'role_not_found',
    });

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(fakeCreateInvitation).toHaveBeenCalledTimes(1);
    expect(fakeCreateInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      }),
    );
    await app.close();
  });

  it('returns 409 when an active invitation already exists', async () => {
    const fakeCreateInvitation = vi.fn().mockResolvedValue({
      ok: false,
      reason: 'invitation_already_exists',
    });

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(409);

    expect(response.json()).toEqual({
      error: 'Invitation already exists',
    });

    expect(fakeCreateInvitation).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it('returns 403 when the target role is not assignable', async () => {
    const fakeCreateInvitation = vi.fn().mockResolvedValue({
      ok: false,
      reason: 'role_not_assignable',
    });

    const app = await buildTestApp({
      createInvitation: fakeCreateInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/business/${businessId}/invitations`,
      payload: {
        email: 'test@example.com',
        roleId,
      },
    });

    expect(response.statusCode).toBe(403);

    expect(response.json()).toEqual({
      error: 'Forbidden',
    });

    expect(fakeCreateInvitation).toHaveBeenCalledTimes(1);

    await app.close();
  });
});
