import { z } from 'zod';

export const businessParamsSchema = z.object({
  businessId: z.uuid(),
});
