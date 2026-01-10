// Re-export all types from schema for convenience
export type { User, NewUser } from '../db/schema/users.js';
export type { Session, NewSession } from '../db/schema/sessions.js';
export type { Class, NewClass } from '../db/schema/classes.js';
export type { Evaluation, NewEvaluation } from '../db/schema/evaluations.js';
export type { EvaluationClass, NewEvaluationClass } from '../db/schema/evaluationClasses.js';
export type { Question, NewQuestion } from '../db/schema/questions.js';
export type { Student, NewStudent } from '../db/schema/students.js';
export type { StudentCopy, NewStudentCopy } from '../db/schema/studentCopies.js';
export type { Answer, NewAnswer, AiSuggestion } from '../db/schema/answers.js';

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
