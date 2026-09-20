import { buildApp } from './app.js';

const app = buildApp();

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Shutting down');

  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error(error, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({
    port: 3000,
    host: '0.0.0.0',
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
