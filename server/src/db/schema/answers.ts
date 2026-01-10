import { pgTable, uuid, text, decimal, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { studentCopies } from './studentCopies.js';
import { questions } from './questions.js';

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentCopyId: uuid('student_copy_id').notNull().references(() => studentCopies.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  studentAnswer: text('student_answer').notNull(),
  score: decimal('score', { precision: 5, scale: 2 }),
  comment: text('comment'),
  aiSuggestion: jsonb('ai_suggestion'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

// Type for AI suggestion JSON
export interface AiSuggestion {
  score: number;
  comment: string;
  confidence: number;
}
