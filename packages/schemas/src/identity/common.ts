import { z } from 'zod';

export const acceptInvitationParamsSchema = z.object({
  invitationId: z.uuid(),
});

export type AcceptInvitationParams = z.infer<
  typeof acceptInvitationParamsSchema
>;
