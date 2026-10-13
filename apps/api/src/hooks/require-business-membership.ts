import type { FastifyRequest } from 'fastify';

import { findMembership } from '../services/identity/membership-service.js';
import { businessParamsSchema } from '@flowpilot/schemas';
import { AppError } from '../errors/app-error.js';

export async function requireBusinessMembership(request: FastifyRequest) {
  if (!request.user) {
    throw new AppError(401, 'unauthorized', 'Authentication is required.');
  }

  const paramsResult = businessParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    throw new AppError(400, 'invalid_request', 'Invalid request.');
  }

  const { businessId } = paramsResult.data;

  const membership = await findMembership(
    request.server.db,
    request.user.id,
    businessId,
  );

  if (!membership) {
    throw new AppError(
      403,
      'business_membership_required',
      'Business membership is required.',
    );
  }

  request.membership = membership;
}
