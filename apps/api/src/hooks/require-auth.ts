import type { FastifyRequest } from 'fastify';

import { AppError } from '../errors/app-error.js';

export async function requireAuth(request: FastifyRequest) {
  if (!request.user) {
    throw new AppError(401, 'unauthorized', 'Authentication is required.');
  }
}
