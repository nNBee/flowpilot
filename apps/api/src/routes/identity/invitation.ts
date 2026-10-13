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
import { AppError } from '../../errors/app-error.js';

type InvitationRouteOptions = {
  acceptInvitation?: typeof acceptInvitation;
  createInvitation?: typeof createInvitation;
  webAppUrl: string;
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
        throw new AppError(400, 'invalid_request', 'Invalid request.');
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
        webAppUrl: options.webAppUrl,
        logger: request.log,
      });

      if (!result.ok) {
        switch (result.reason) {
          case 'role_not_found':
            throw new AppError(400, 'role_not_found', 'Invalid role.');

          case 'inviter_role_not_found':
            throw new AppError(
              403,
              'inviter_role_not_found',
              'You are not allowed to create this invitation.',
            );

          case 'role_not_assignable':
            throw new AppError(
              403,
              'role_not_assignable',
              'You are not allowed to assign this role.',
            );

          case 'invitation_already_exists':
            throw new AppError(
              409,
              'invitation_already_exists',
              'An active invitation already exists.',
            );

          case 'user_already_member':
            throw new AppError(
              409,
              'user_already_member',
              'This user is already a member of the business.',
            );
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
        throw new AppError(400, 'invalid_request', 'Invalid request.');
      }

      const user = request.user;

      if (!user) {
        throw new AppError(401, 'unauthorized', 'Authentication is required.');
      }

      if (!user.email) {
        throw new AppError(
          403,
          'user_email_required',
          'An authenticated email address is required.',
        );
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
            throw new AppError(
              404,
              'invitation_not_found',
              'Invitation not found.',
            );

          case 'invitation_revoked':
            throw new AppError(
              410,
              'invitation_revoked',
              'This invitation has been revoked.',
            );

          case 'invitation_expired':
            throw new AppError(
              410,
              'invitation_expired',
              'This invitation has expired.',
            );

          case 'invitation_email_mismatch':
            throw new AppError(
              403,
              'invitation_email_mismatch',
              'You cannot accept this invitation.',
            );

          case 'invitation_already_accepted':
            throw new AppError(
              409,
              'invitation_already_accepted',
              'This invitation has already been accepted.',
            );

          case 'invitation_no_longer_available':
            throw new AppError(
              409,
              'invitation_no_longer_available',
              'This invitation is no longer available.',
            );

          case 'user_already_member':
            throw new AppError(
              409,
              'user_already_member',
              'This user is already a member of the business.',
            );

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
