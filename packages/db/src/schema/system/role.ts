import { boolean, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';

import { business } from '../business/business.js';

export const role = pgTable(
  'role',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => business.id, {
        onDelete: 'cascade',
      }),
    key: text('key').notNull(),
    name: text('name').notNull(),
    isSystem: boolean('is_system').default(false).notNull(),
  },
  (table) => [
    unique('role_business_id_key_unique').on(table.businessId, table.key),
    unique('role_business_id_id_unique').on(table.businessId, table.id),
  ],
);
