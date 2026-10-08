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
    email: 'test@example.com',
  } as never;
};

type InvitationRouteOptions = Parameters<typeof invitationRoute>[1];

type BuildTestAppOptions = {
  createInvitation?: NonNullable<InvitationRouteOptions['createInvitation']>;
  acceptInvitation?: NonNullable<InvitationRouteOptions['acceptInvitation']>;
  requireAuth?: preHandlerHookHandler;
  requireBusinessMembership?: preHandlerHookHandler;
  requireInvitePermission?: preHandlerHookHandler;
};

async function buildTestApp({
  createInvitation = vi.fn(),
  acceptInvitation = vi.fn(),
  requireAuth = fakeRequireAuth,
  requireBusinessMembership = allowMembership,
  requireInvitePermission = allowRequest,
}: BuildTestAppOptions = {}) {
  const app = Fastify();

  await app.register(invitationRoute, {
    createInvitation,
    acceptInvitation,
    requireAuth,
    requireBusinessMembership,
    requireInvitePermission,
  });

  return app;
}

describe('POST /business/:businessId/invitations', () => {
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

  it('returns 409 when the user is already a member', async () => {
    const fakeCreateInvitation = vi.fn().mockResolvedValue({
      ok: false,
      reason: 'user_already_member',
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
      error: 'User is already a member',
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

describe('POST /invitations/:invitationId/accept', () => {
  it('accepts a valid invitation', async () => {
    const fakeAcceptInvitation = vi.fn().mockResolvedValue({
      ok: true,
    });

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/invitations/${fakeInvitationId}/accept`,
      payload: {
        firstName: '  Test  ',
        lastName: '  User  ',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');

    expect(fakeAcceptInvitation).toHaveBeenCalledTimes(1);
    expect(fakeAcceptInvitation).toHaveBeenCalledWith({
      db: app.db,
      invitationId: fakeInvitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    await app.close();
  });

  it('does not require an existing membership or invite permission', async () => {
    const fakeAcceptInvitation = vi.fn().mockResolvedValue({
      ok: true,
    });

    const forbiddenMembership = vi.fn(forbidden);
    const forbiddenPermission = vi.fn(forbidden);

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
      requireBusinessMembership: forbiddenMembership,
      requireInvitePermission: forbiddenPermission,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/invitations/${fakeInvitationId}/accept`,
      payload: {
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(204);

    expect(fakeAcceptInvitation).toHaveBeenCalledTimes(1);
    expect(forbiddenMembership).not.toHaveBeenCalled();
    expect(forbiddenPermission).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when authentication fails', async () => {
    const fakeAcceptInvitation = vi.fn();

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
      requireAuth: unauthorized,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/invitations/${fakeInvitationId}/accept`,
      payload: {
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(fakeAcceptInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 for an invalid invitation id', async () => {
    const fakeAcceptInvitation = vi.fn();

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/invitations/not-a-uuid/accept',
      payload: {
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Invalid request',
    });

    expect(fakeAcceptInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 for an invalid request body', async () => {
    const fakeAcceptInvitation = vi.fn();

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/invitations/${fakeInvitationId}/accept`,
      payload: {
        firstName: ' ',
        lastName: '',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Invalid request',
    });

    expect(fakeAcceptInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated user has no email', async () => {
    const fakeAcceptInvitation = vi.fn();

    const authenticatedWithoutEmail: preHandlerHookHandler = async (
      request,
    ) => {
      request.user = {
        id: userId,
      } as never;
    };

    const app = await buildTestApp({
      acceptInvitation: fakeAcceptInvitation,
      requireAuth: authenticatedWithoutEmail,
    });

    const response = await app.inject({
      method: 'POST',
      url: `/invitations/${fakeInvitationId}/accept`,
      payload: {
        firstName: 'Test',
        lastName: 'User',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: 'Forbidden',
    });

    expect(fakeAcceptInvitation).not.toHaveBeenCalled();

    await app.close();
  });

  it.each([
    ['invitation_not_found', 404, 'Invitation not found'],
    ['invitation_revoked', 410, 'Invitation is no longer available'],
    ['invitation_expired', 410, 'Invitation is no longer available'],
    ['invitation_email_mismatch', 403, 'Forbidden'],
    ['invitation_already_accepted', 409, 'Invitation already accepted'],
    [
      'invitation_no_longer_available',
      409,
      'Invitation is no longer available',
    ],
    ['user_already_member', 409, 'User is already a member'],
  ] as const)(
    'maps %s to HTTP %i',
    async (reason, expectedStatus, expectedError) => {
      const fakeAcceptInvitation = vi.fn().mockResolvedValue({
        ok: false,
        reason,
      });

      const app = await buildTestApp({
        acceptInvitation: fakeAcceptInvitation,
      });

      const response = await app.inject({
        method: 'POST',
        url: `/invitations/${fakeInvitationId}/accept`,
        payload: {
          firstName: 'Test',
          lastName: 'User',
        },
      });

      expect(response.statusCode).toBe(expectedStatus);
      expect(response.json()).toEqual({
        error: expectedError,
      });

      expect(fakeAcceptInvitation).toHaveBeenCalledTimes(1);

      await app.close();
    },
  );
});
