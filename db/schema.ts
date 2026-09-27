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
 caption: text('caption').notNull().default(''), createdAt: text('created_at').notNull(),
}, t=>[index('idx_photos_entry').on(t.entryId)]);
