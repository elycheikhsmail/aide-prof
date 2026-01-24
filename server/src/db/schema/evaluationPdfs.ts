import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { evaluations } from './evaluations';

export const pdfTypeEnum = pgEnum('pdf_type', ['combined', 'questions', 'answers']);

export const evaluationPdfs = pgTable('evaluation_pdfs', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id')
    .notNull()
    .references(() => evaluations.id, { onDelete: 'cascade' }),
  type: pdfTypeEnum('type').notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileUrl: varchar('file_url', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EvaluationPdf = typeof evaluationPdfs.$inferSelect;
export type NewEvaluationPdf = typeof evaluationPdfs.$inferInsert;
