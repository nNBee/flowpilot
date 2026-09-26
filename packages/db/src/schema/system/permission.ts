import { pgTable, text } from 'drizzle-orm/pg-core';

export const permission = pgTable('permission', {
  key: text('key').primaryKey(),
  description: text('description').notNull(),
});
