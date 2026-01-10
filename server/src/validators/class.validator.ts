import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Le nom de la classe est requis'),
  subject: z.string().min(1, 'La matière est requise'),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, 'Le nom de la classe est requis').optional(),
  subject: z.string().min(1, 'La matière est requise').optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
