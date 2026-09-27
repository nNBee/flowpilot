import type { FastifyReply, FastifyRequest } from 'fastify';

import { findMembership } from '../services/identity/membership-service.js';

export async function requireBusinessMembership(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
    });
  }

  const params = request.params as {
    businessId?: string;
  };

  if (!params.businessId) {
    return reply.code(400).send({
      error: 'Invalid request',
    });
  }

  const membership = await findMembership(
    request.server.db,
    request.user.id,
    params.businessId,
  );

  if (!membership) {
    return reply.code(403).send({
      error: 'Forbidden',
    });
  }

  request.membership = membership;
}
