import { config as loadEnv } from 'dotenv';
import { buildApp } from './app.js';
import { parseConfig } from './config.js';

loadEnv({
  path: new URL('../../../.env', import.meta.url),
});

let config;

try {
  config = parseConfig(process.env);
} catch (error) {
  console.error('Error parsing config:', error);
  process.exit(1);
}

const app = buildApp({ config });

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
    port: config.PORT,
    host: config.HOST,
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
