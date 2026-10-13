import type {
  FastifyRequest,
  preHandlerHookHandler,
} from 'fastify';

import { roleHasPermission } from '../services/identity/permission-service.js';
import { AppError } from '../errors/app-error.js';

export function requirePermission(
  permissionKey: string,
): preHandlerHookHandler {
  return async function permissionGuard(request: FastifyRequest) {
    const membership = request.membership;

    if (!membership) {
      throw new AppError(403, 'forbidden', 'Permission denied.');
    }

    const hasPermission = await roleHasPermission(
      request.server.db,
      membership.roleId,
      permissionKey,
    );

    if (!hasPermission) {
      throw new AppError(403, 'forbidden', 'Permission denied.');
    }
  };
}
