import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.email(),
  roleId: z.uuid(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationBodySchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export type AcceptInvitationBody = z.infer<typeof acceptInvitationBodySchema>;
