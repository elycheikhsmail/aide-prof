import { pgTable, uuid, varchar, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { evaluations } from './evaluations.js';
import { students } from './students.js';

export const copyStatusEnum = pgEnum('copy_status', ['pending', 'associated', 'corrected', 'validated']);

export const studentCopies = pgTable('student_copies', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  scanUrl: varchar('scan_url', { length: 500 }),
  status: copyStatusEnum('status').notNull().default('pending'),
  totalScore: decimal('total_score', { precision: 5, scale: 2 }),
  correctedAt: timestamp('corrected_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type StudentCopy = typeof studentCopies.$inferSelect;
export type NewStudentCopy = typeof studentCopies.$inferInsert;
