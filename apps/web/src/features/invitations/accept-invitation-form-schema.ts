import { acceptInvitationBodySchema } from '@flowpilot/schemas';
import { z } from 'zod';

export const acceptInvitationFormSchema = acceptInvitationBodySchema
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type AcceptInvitationFormValues = z.infer<
  typeof acceptInvitationFormSchema
>;
