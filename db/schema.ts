import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const entries = sqliteTable('entries', {
 id: text('id').primaryKey(), kind: text('kind').notNull(), title: text('title').notNull(),
 description: text('description').notNull().default(''), date: text('date').notNull().default(''),
 location: text('location').notNull().default(''), status: text('status').notNull().default('draft'),
 createdBy: text('created_by').notNull(), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, t => [index('idx_entries_status_date').on(t.status, t.date)]);
export const photos = sqliteTable('photos', {
 id: text('id').primaryKey(), entryId: text('entry_id').notNull().references(()=>entries.id),
 objectKey: text('object_key').notNull(), mime: text('mime').notNull(), size: integer('size').notNull(),
 sortOrder: integer('sort_order').notNull().default(0), caption: text('caption').notNull().default(''), createdAt: text('created_at').notNull(),
}, t=>[index('idx_photos_entry').on(t.entryId)]);

export const settings = sqliteTable('settings', {id: text('id').primaryKey(), value: text('value').notNull()});

export const authUsers = sqliteTable('auth_users', {
 id:text('id').primaryKey(), email:text('email').notNull().unique(), name:text('name').notNull(),
 role:text('role').notNull(), passwordHash:text('password_hash').notNull().default(''),
 enabled:integer('enabled').notNull().default(1), inviteHash:text('invite_hash'), inviteExpires:integer('invite_expires'),
 createdAt:integer('created_at').notNull(),
});
export const authSessions = sqliteTable('auth_sessions', {
 tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>authUsers.id), expiresAt:integer('expires_at').notNull(),
},t=>[index('idx_auth_sessions_user').on(t.userId),index('idx_auth_sessions_expiry').on(t.expiresAt)]);
export const authAttempts = sqliteTable('auth_attempts', {key:text('key').primaryKey(), count:integer('count').notNull(), expiresAt:integer('expires_at').notNull()});
