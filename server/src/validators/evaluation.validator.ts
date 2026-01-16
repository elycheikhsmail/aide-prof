import { z } from 'zod';

// Schéma pour une question lors de la création
const questionInputSchema = z.object({
  number: z.number().int().positive('Le numéro de question doit être positif'),
  statement: z.string().min(1, 'L\'énoncé est requis'),
  modelAnswer: z.string().default(''),
  points: z.number().int().positive('Les points doivent être positifs'),
  estimatedLines: z.number().int().positive('Le nombre de lignes estimé doit être positif').default(5),
});

export const createEvaluationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  subject: z.string().min(1, 'La matière est requise'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format: YYYY-MM-DD)'),
  duration: z.number().int().positive('La durée doit être positive'),
  totalPoints: z.number().int().positive('Le total de points doit être positif'),
  classIds: z.array(z.string().uuid()).optional(),
  questions: z.array(questionInputSchema).optional(),
});

export const updateEvaluationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').optional(),
  subject: z.string().min(1, 'La matière est requise').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format: YYYY-MM-DD)').optional(),
  duration: z.number().int().positive('La durée doit être positive').optional(),
  totalPoints: z.number().int().positive('Le total de points doit être positif').optional(),
  status: z.enum(['draft', 'active', 'correcting', 'completed']).optional(),
});

export const createQuestionSchema = z.object({
  number: z.number().int().positive('Le numéro de question doit être positif'),
  statement: z.string().min(1, 'L\'énoncé est requis'),
  modelAnswer: z.string().min(1, 'La réponse modèle est requise'),
  points: z.number().int().positive('Les points doivent être positifs'),
  estimatedLines: z.number().int().positive('Le nombre de lignes estimé doit être positif'),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
