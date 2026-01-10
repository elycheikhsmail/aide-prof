import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  photo: z.string().url('URL invalide').optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
