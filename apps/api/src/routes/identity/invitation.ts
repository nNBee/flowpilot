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
        businessId,
        roleId,
        email,
        invitedByUserId: request.user!.id,
      });

      if (!result.ok) {
        if (result.reason === 'role_not_found') {
          return reply.code(400).send({
            error: 'Invalid role',
          });
        }
      }

      return reply.code(201).send({
        invitation: result.invitation,
      });
    },
  );
};
