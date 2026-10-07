import { createDatabase } from '@flowpilot/db';
import { config as loadEnv } from 'dotenv';

loadEnv({
  path: new URL('../../../../.env', import.meta.url),
});

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

if (
  TEST_DATABASE_URL !==
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
) {
  throw new Error('Invalid or missing TEST_DATABASE_URL');
}

export const { db, pool } = createDatabase(TEST_DATABASE_URL);

export async function assertTestDatabase() {
  const result = await pool.query<{
    current_database: string;
    auth_users: string | null;
    business: string | null;
  }>(`
    SELECT
      current_database() AS current_database,
      to_regclass('auth.users')::text AS auth_users,
      to_regclass('public.business')::text AS business
  `);

  const database = result.rows[0];

  if (
    !database ||
    database.current_database !== 'postgres' ||
    database.auth_users !== 'auth.users' ||
    database.business !== 'business'
  ) {
    throw new Error(
      'Database is not a valid FlowPilot integration test database',
    );
  }
}

export async function cleanTestDatabase() {
  await assertTestDatabase();

  await pool.query(`
    TRUNCATE TABLE
      invitation,
      membership,
      role_permission,
      role,
      business,
      app_user
    CASCADE
  `);
}

export async function deleteTestAuthUser(userId: string) {
  await assertTestDatabase();

  await pool.query(
    `
      DELETE FROM auth.users
      WHERE id = $1
    `,
    [userId],
  );
}
