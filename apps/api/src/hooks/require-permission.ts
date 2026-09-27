import type {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from 'fastify';

import { roleHasPermission } from '../services/identity/permission-service.js';

export function requirePermission(
  permissionKey: string,
): preHandlerHookHandler {
  return async function permissionGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const membership = request.membership;

    if (!membership) {
      return reply.code(403).send({
        error: 'Forbidden',
      });
    }

    const hasPermission = await roleHasPermission(
      request.server.db,
      membership.roleId,
      permissionKey,
    );

    if (!hasPermission) {
      return reply.code(403).send({
        error: 'Forbidden',
      });
    }
  };
}
