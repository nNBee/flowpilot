import { pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

import { permission } from './permission.js';
import { role } from './role.js';

export const rolePermission = pgTable(
  'role_permission',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, {
        onDelete: 'cascade',
      }),

    permissionKey: text('permission_key')
      .notNull()
      .references(() => permission.key, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionKey],
    }),
  ],
);
