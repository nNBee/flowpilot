import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.email(),
  roleId: z.uuid(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
