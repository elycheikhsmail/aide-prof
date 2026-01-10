import { pgTable, uuid, decimal, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { classes } from './classes.js';

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  averageScore: decimal('average_score', { precision: 5, scale: 2 }),
  rank: integer('rank'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
