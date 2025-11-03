import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  theme: text('theme')
    .notNull()
    .default('system'),
  labUpdates: boolean('lab_updates')
    .notNull()
    .default(true),
  digestEmails: boolean('digest_emails')
    .notNull()
    .default(false),
  supabaseConnected: boolean('supabase_connected')
    .notNull()
    .default(true),
  betterAuthConnected: boolean('better_auth_connected')
    .notNull()
    .default(true),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
