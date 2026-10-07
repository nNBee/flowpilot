import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

loadEnv({
  path: new URL('../../.env', import.meta.url),
});

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

if (
  TEST_DATABASE_URL !==
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
) {
  throw new Error('Invalid or missing TEST_DATABASE_URL');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: TEST_DATABASE_URL,
  },
});
