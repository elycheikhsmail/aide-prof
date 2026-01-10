import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { evaluations } from './evaluations.js';

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  statement: text('statement').notNull(),
  modelAnswer: text('model_answer').notNull(),
  points: integer('points').notNull(),
  estimatedLines: integer('estimated_lines').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
