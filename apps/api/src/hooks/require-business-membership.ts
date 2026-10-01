import type { FastifyReply, FastifyRequest } from 'fastify';

import { findMembership } from '../services/identity/membership-service.js';
import { businessParamsSchema } from '@flowpilot/schemas';

export async function requireBusinessMembership(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
    });
  }

  const paramsResult = businessParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return reply.code(400).send({
      error: 'Invalid request',
    });
  }

  const { businessId } = paramsResult.data;

  const membership = await findMembership(
    request.server.db,
    request.user.id,
    businessId,
  );

  if (!membership) {
    return reply.code(403).send({
      error: 'Forbidden',
    });
  }

  request.membership = membership;
}
