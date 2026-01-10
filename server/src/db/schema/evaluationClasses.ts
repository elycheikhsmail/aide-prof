import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { evaluations } from './evaluations';
import { classes } from './classes';

export const evaluationClasses = pgTable('evaluation_classes', {
  evaluationId: uuid('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.evaluationId, table.classId] }),
]);

export type EvaluationClass = typeof evaluationClasses.$inferSelect;
export type NewEvaluationClass = typeof evaluationClasses.$inferInsert;
