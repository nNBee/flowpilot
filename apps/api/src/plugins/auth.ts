import fp from 'fastify-plugin';

export default fp(async function authPlugin(app) {
  app.decorateRequest('user', null);

  app.addHook('preHandler', async (request, reply) => {
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
      return reply.code(401).send({
        error: 'Unauthorized',
      });
    }

    request.user = user;
  });
});
