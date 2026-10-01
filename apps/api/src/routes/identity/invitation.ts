import type { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';

import {
  createInvitationSchema,
  businessParamsSchema as createInvitationParamsSchema,
} from '@flowpilot/schemas';

import { requireAuth } from '../../hooks/require-auth.js';
import { requireBusinessMembership } from '../../hooks/require-business-membership.js';
import { requirePermission } from '../../hooks/require-permission.js';
import { createInvitation } from '../../services/identity/invitation-service.js';

type InvitationRouteOptions = {
  createInvitation?: typeof createInvitation;
  requireAuth?: preHandlerHookHandler;
  requireBusinessMembership?: preHandlerHookHandler;
  requireInvitePermission?: preHandlerHookHandler;
};

export const invitationRoute: FastifyPluginAsync<
  InvitationRouteOptions
> = async (app, options) => {
  const createInvitationFn = options.createInvitation ?? createInvitation;
  const requireAuthFn = options.requireAuth ?? requireAuth;

  const requireBusinessMembershipFn =
    options.requireBusinessMembership ?? requireBusinessMembership;

  const requireInvitePermissionFn =
    options.requireInvitePermission ?? requirePermission('member.invite');

  app.post(
    '/business/:businessId/invitations',
    {
      preHandler: [
        requireAuthFn,
        requireBusinessMembershipFn,
        requireInvitePermissionFn,
      ],
    },
    async (request, reply) => {
      const paramsResult = createInvitationParamsSchema.safeParse(
        request.params,
      );
      const bodyResult = createInvitationSchema.safeParse(request.body);

      if (!paramsResult.success || !bodyResult.success) {
        return reply.code(400).send({
          error: 'Invalid request',
        });
      }

      const { businessId } = paramsResult.data;
      const { email, roleId } = bodyResult.data;

      const result = await createInvitationFn({
        db: app.db,
        supabase: app.supabase,
        inviterRoleId: request.membership!.roleId,
        businessId,
        roleId,
        email,
        invitedByUserId: request.user!.id,
        logger: request.log,
      });

      if (!result.ok) {
        switch (result.reason) {
          case 'role_not_found':
            return reply.code(400).send({
              error: 'Invalid role',
            });

          case 'inviter_role_not_found':
          case 'role_not_assignable':
            return reply.code(403).send({
              error: 'Forbidden',
            });

          case 'invitation_already_exists':
            return reply.code(409).send({
              error: 'Invitation already exists',
            });
        }
      }

      return reply.code(201).send({
        invitation: result.invitation,
      });
    },
  );
};
