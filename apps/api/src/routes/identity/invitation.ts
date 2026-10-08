import type { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';
import {
  acceptInvitationBodySchema,
  acceptInvitationParamsSchema,
  createInvitationSchema,
  businessParamsSchema as createInvitationParamsSchema,
} from '@flowpilot/schemas';
import { requireAuth } from '../../hooks/require-auth.js';
import { requireBusinessMembership } from '../../hooks/require-business-membership.js';
import { requirePermission } from '../../hooks/require-permission.js';
import {
  acceptInvitation,
  createInvitation,
} from '../../services/identity/invitation-service.js';

type InvitationRouteOptions = {
  acceptInvitation?: typeof acceptInvitation;
  createInvitation?: typeof createInvitation;
  requireAuth?: preHandlerHookHandler;
  requireBusinessMembership?: preHandlerHookHandler;
  requireInvitePermission?: preHandlerHookHandler;
};

export const invitationRoute: FastifyPluginAsync<
  InvitationRouteOptions
> = async (app, options) => {
  const createInvitationFn = options.createInvitation ?? createInvitation;
  const acceptInvitationFn = options.acceptInvitation ?? acceptInvitation;

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
          case 'user_already_member':
            return reply.code(409).send({
              error: 'User is already a member',
            });
        }
      }

      return reply.code(201).send({
        invitation: result.invitation,
      });
    },
  );

  app.post(
    '/invitations/:invitationId/accept',
    {
      preHandler: [requireAuthFn],
    },
    async (request, reply) => {
      const paramsResult = acceptInvitationParamsSchema.safeParse(
        request.params,
      );

      const bodyResult = acceptInvitationBodySchema.safeParse(request.body);

      if (!paramsResult.success || !bodyResult.success) {
        return reply.code(400).send({
          error: 'Invalid request',
        });
      }

      const user = request.user;

      if (!user) {
        return reply.code(401).send({
          error: 'Unauthorized',
        });
      }

      if (!user.email) {
        return reply.code(403).send({
          error: 'Forbidden',
        });
      }

      const { invitationId } = paramsResult.data;
      const { firstName, lastName } = bodyResult.data;

      const result = await acceptInvitationFn({
        db: app.db,
        invitationId,
        userId: user.id,
        userEmail: user.email,
        firstName,
        lastName,
      });

      if (!result.ok) {
        const reason = result.reason;

        switch (reason) {
          case 'invitation_not_found':
            return reply.code(404).send({
              error: 'Invitation not found',
            });

          case 'invitation_revoked':
          case 'invitation_expired':
            return reply.code(410).send({
              error: 'Invitation is no longer available',
            });

          case 'invitation_email_mismatch':
            return reply.code(403).send({
              error: 'Forbidden',
            });

          case 'invitation_already_accepted':
            return reply.code(409).send({
              error: 'Invitation already accepted',
            });

          case 'invitation_no_longer_available':
            return reply.code(409).send({
              error: 'Invitation is no longer available',
            });

          case 'user_already_member':
            return reply.code(409).send({
              error: 'User is already a member',
            });

          default: {
            const unhandledReason: never = reason;
            throw new Error(
              `Unhandled accept invitation result: ${unhandledReason}`,
            );
          }
        }
      }

      return reply.code(204).send();
    },
  );
};
