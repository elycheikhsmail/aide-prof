import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const subjects = pgTable('subjects', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(), // e.g: 'math', 'physics'
    label: varchar('label', { length: 255 }).notNull(), // e.g: 'Mathématiques'
    icon: varchar('icon', { length: 50 }), // icon name for frontend
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
