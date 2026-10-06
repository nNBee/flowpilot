import { z } from 'zod';

export const businessParamsSchema = z.object({
  businessId: z.uuid(),
});

export type BusinessParams = z.infer<typeof businessParamsSchema>;
