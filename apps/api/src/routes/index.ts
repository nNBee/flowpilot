import type { FastifyPluginAsync } from 'fastify';
import * as identityRoutes from './identity/index.js';

type RoutesOptions = {
  webAppUrl: string;
};

export const routes: FastifyPluginAsync<RoutesOptions> = async (
  app,
  options,
) => {
  app.register(identityRoutes.invitationRoute, {
    webAppUrl: options.webAppUrl,
  });
};
