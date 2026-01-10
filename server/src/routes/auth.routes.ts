import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { env } from '../config/env.js';

const auth = new Hono();

// POST /api/v1/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const result = await authService.register(data);

    // Set session cookie
    c.header(
      'Set-Cookie',
      `session=${result.sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${env.SESSION_MAX_AGE / 1000}`
    );

    return c.json({ user: result.user }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
    return c.json({ error: message }, 400);
  }
});

// POST /api/v1/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const result = await authService.login(data);

    // Set session cookie
    c.header(
      'Set-Cookie',
      `session=${result.sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${env.SESSION_MAX_AGE / 1000}`
    );

    return c.json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la connexion';
    return c.json({ error: message }, 401);
  }
});

// POST /api/v1/auth/logout
auth.post('/logout', authMiddleware, async (c) => {
  const sessionId = c.get('sessionId');
  await authService.logout(sessionId);

  // Clear session cookie
  c.header('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

  return c.json({ message: 'Déconnexion réussie' });
});

// GET /api/v1/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const { passwordHash: _, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

export default auth;
