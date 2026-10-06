import { pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const auth = pgSchema('auth');
const authUsers = auth.table('users', {
  id: uuid('id').primaryKey(),
});
export const appUser = pgTable('app_user', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, {
      onDelete: 'cascade',
    }),
  email: text('email').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
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
});
