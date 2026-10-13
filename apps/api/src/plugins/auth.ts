import fp from 'fastify-plugin';
import { AppError } from '../errors/app-error.js';

export default fp(async function authPlugin(app) {
  app.decorateRequest('user', null);

  app.addHook('preHandler', async (request) => {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return;
    }

    const token = authorization.slice('Bearer '.length);

    const {
      data: { user },
      error,
    } = await app.supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, 'unauthorized', 'Authentication is required.');
    }

    request.user = user;
  });
});
