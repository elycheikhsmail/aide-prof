import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { sessionRepository } from '../repositories/session.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { User } from '../db/schema/users.js';

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    sessionId: string;
  }
}

// Get session ID from cookie
const getSessionId = (c: Context): string | null => {
  const cookie = c.req.header('Cookie');
  if (!cookie) return null;

  const sessionCookie = cookie.split(';').find(c => c.trim().startsWith('session='));
  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1]?.trim() ?? null;
};

// Auth middleware - requires valid session
export const authMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getSessionId(c);

  if (!sessionId) {
    return c.json({ error: 'Non authentifié' }, 401);
  }

  const session = await sessionRepository.findById(sessionId);

  if (!session) {
    return c.json({ error: 'Session invalide' }, 401);
  }

  if (new Date(session.expiresAt) < new Date()) {
    await sessionRepository.delete(sessionId);
    return c.json({ error: 'Session expirée' }, 401);
  }

  const user = await userRepository.findById(session.userId);

  if (!user) {
    await sessionRepository.delete(sessionId);
    return c.json({ error: 'Utilisateur non trouvé' }, 401);
  }

  c.set('user', user);
  c.set('sessionId', sessionId);

  await next();
});

// Professor only middleware
export const professorMiddleware = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user || user.role !== 'professor') {
    return c.json({ error: 'Accès réservé aux professeurs' }, 403);
  }

  await next();
});

// Student only middleware
export const studentMiddleware = createMiddleware(async (c, next) => {
  const user = c.get('user');

  if (!user || user.role !== 'student') {
    return c.json({ error: 'Accès réservé aux étudiants' }, 403);
  }

  await next();
});
