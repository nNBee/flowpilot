import { acceptInvitationBodySchema } from '@flowpilot/schemas';
import type { TFunction } from 'i18next';
import { z } from 'zod';

export function createAcceptInvitationFormSchema(t: TFunction) {
  return acceptInvitationBodySchema
    .extend({
      firstName: z.string().trim().min(1, t('invitation.firstNameRequired')),

      lastName: z.string().trim().min(1, t('invitation.lastNameRequired')),

      password: z.string().min(8, t('invitation.passwordMinLength')),

      confirmPassword: z
        .string()
        .min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('invitation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type AcceptInvitationFormValues = z.infer<
  ReturnType<typeof createAcceptInvitationFormSchema>
>;
