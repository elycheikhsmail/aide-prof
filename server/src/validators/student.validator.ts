import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  classId: z.string().uuid('ID de classe invalide'),
});

export const updateStudentSchema = z.object({
  classId: z.string().uuid('ID de classe invalide').optional(),
  averageScore: z.number().min(0).max(20).optional(),
  rank: z.number().int().positive().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
