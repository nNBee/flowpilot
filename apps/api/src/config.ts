import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  HOST: z.string().default('0.0.0.0'),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1),
});

export function parseConfig(env: NodeJS.ProcessEnv) {
  const parsedEnv = envSchema.safeParse(env);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(
        parsedEnv.error.flatten(),
      )}`,
    );
  }

  return parsedEnv.data;
}

export type Config = ReturnType<typeof parseConfig>;
