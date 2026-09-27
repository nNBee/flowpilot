import { and, eq } from 'drizzle-orm';
import { membership } from '@flowpilot/db';

import type { Database } from '@flowpilot/db';

export async function findMembership(
  db: Database,
  userId: string,
  businessId: string,
) {
  const [result] = await db
    .select()
    .from(membership)
    .where(
      and(eq(membership.userId, userId), eq(membership.businessId, businessId)),
    )
    .limit(1);

  return result ?? null;
}
