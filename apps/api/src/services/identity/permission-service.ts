import { and, eq } from 'drizzle-orm';
import { permission, rolePermission } from '@flowpilot/db';

import type { Database } from '@flowpilot/db';

export async function roleHasPermission(
  db: Database,
  roleId: string,
  permissionKey: string,
) {
  const [result] = await db
    .select({ key: permission.key })
    .from(rolePermission)
    .innerJoin(permission, eq(rolePermission.permissionKey, permission.key))
    .where(
      and(eq(rolePermission.roleId, roleId), eq(permission.key, permissionKey)),
    )
    .limit(1);

  return Boolean(result);
}
