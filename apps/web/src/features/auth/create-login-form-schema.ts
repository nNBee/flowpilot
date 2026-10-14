import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createLoginFormSchema(t: TFunction) {
  return z.object({
    email: z.email({
      error: () => t('validation.emailInvalid'),
    }),
    password: z.string().min(1, {
      error: () => t('validation.passwordRequired'),
    }),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
