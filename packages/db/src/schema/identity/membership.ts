import { pgTable, foreignKey, unique, uuid } from 'drizzle-orm/pg-core';

import { appUser } from './app-user.js';
import { business } from '../business/business.js';
import { role } from '../system/role.js';

export const membership = pgTable(
  'membership',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => appUser.id, {
        onDelete: 'cascade',
      }),
    businessId: uuid('business_id')
      .notNull()
      .references(() => business.id, {
        onDelete: 'cascade',
      }),
    roleId: uuid('role_id').notNull(),
  },
  (table) => [
    unique('membership_user_id_business_id_unique').on(
      table.userId,
      table.businessId,
    ),

    foreignKey({
      columns: [table.businessId, table.roleId],
      foreignColumns: [role.businessId, role.id],
      name: 'membership_business_id_role_id_role_fk',
    }),
  ],
);
