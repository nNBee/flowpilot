import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { business } from '../business/business.js';
import { role } from '../system/role.js';
import { appUser } from './app-user.js';

export const invitation = pgTable(
  'invitation',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    businessId: uuid('business_id')
      .notNull()
      .references(() => business.id, {
        onDelete: 'cascade',
      }),

    email: text('email').notNull(),

    roleId: uuid('role_id').notNull(),

    invitedByUserId: uuid('invited_by_user_id').references(() => appUser.id, {
      onDelete: 'set null',
    }),

    acceptedByUserId: uuid('accepted_by_user_id').references(() => appUser.id, {
      onDelete: 'set null',
    }),

    expiresAt: timestamp('expires_at', {
      withTimezone: true,
    }).notNull(),

    acceptedAt: timestamp('accepted_at', {
      withTimezone: true,
    }),

    revokedAt: timestamp('revoked_at', {
      withTimezone: true,
    }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.businessId, table.roleId],
      foreignColumns: [role.businessId, role.id],
      name: 'invitation_business_id_role_id_role_fk',
    }),

    uniqueIndex('invitation_active_business_email_unique')
      .on(table.businessId, sql`lower(btrim(${table.email}))`)
      .where(sql`${table.acceptedAt} IS NULL AND ${table.revokedAt} IS NULL`),

    index('invitation_business_id_role_id_idx').on(
      table.businessId,
      table.roleId,
    ),

    check(
      'invitation_not_accepted_and_revoked',
      sql`NOT (${table.acceptedAt} IS NOT NULL AND ${table.revokedAt} IS NOT NULL)`,
    ),

    check(
      'invitation_accepted_user_requires_accepted_at',
      sql`${table.acceptedByUserId} IS NULL OR ${table.acceptedAt} IS NOT NULL`,
    ),

    check(
      'invitation_expires_after_created',
      sql`${table.expiresAt} > ${table.createdAt}`,
    ),
  ],
);
