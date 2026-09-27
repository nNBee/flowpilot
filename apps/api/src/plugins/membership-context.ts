import fp from 'fastify-plugin';

export default fp(async function membershipContextPlugin(app) {
  app.decorateRequest('membership', null);
});
