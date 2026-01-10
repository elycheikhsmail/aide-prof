import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export interface ApiError {
  error: string;
  details?: unknown;
}

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    return c.json<ApiError>(
      {
        error: 'Erreur de validation',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  // Hono HTTP exception
  if (err instanceof HTTPException) {
    return c.json<ApiError>(
      {
        error: err.message,
      },
      err.status
    );
  }

  // Database errors
  if (err.message?.includes('duplicate key')) {
    return c.json<ApiError>(
      {
        error: 'Cette ressource existe déjà',
      },
      409
    );
  }

  if (err.message?.includes('foreign key')) {
    return c.json<ApiError>(
      {
        error: 'Référence invalide',
      },
      400
    );
  }

  // Default error
  return c.json<ApiError>(
    {
      error: 'Erreur interne du serveur',
    },
    500
  );
};
