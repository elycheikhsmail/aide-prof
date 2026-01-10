import { pgTable, uuid, varchar, timestamp, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const evaluationStatusEnum = pgEnum('evaluation_status', ['draft', 'active', 'correcting', 'completed']);

export const evaluations = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  date: date('date').notNull(),
  duration: integer('duration').notNull(), // in minutes
  totalPoints: integer('total_points').notNull(),
  professorId: uuid('professor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: evaluationStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
