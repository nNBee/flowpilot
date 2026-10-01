import type { FastifyPluginAsync } from 'fastify';
import * as identityRoutes from './identity/index.js';

export const routes: FastifyPluginAsync = async (app) => {
  app.register(identityRoutes.invitationRoute);
};
