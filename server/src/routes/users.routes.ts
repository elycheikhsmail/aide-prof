import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { userService } from '../services/user.service.js';
import { updateUserSchema } from '../validators/user.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const users = new Hono();

// All routes require authentication
users.use('*', authMiddleware);

// GET /api/v1/users
users.get('/', async (c) => {
  const allUsers = await userService.findAll();
  return c.json({ users: allUsers });
});

// GET /api/v1/users/:id
users.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = await userService.findById(id);

  if (!user) {
    return c.json({ error: 'Utilisateur non trouvé' }, 404);
  }

  return c.json({ user });
});

// PATCH /api/v1/users/:id
users.patch('/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  // Users can only update their own profile
  if (currentUser.id !== id) {
    return c.json({ error: 'Non autorisé' }, 403);
  }

  const data = c.req.valid('json');
  const user = await userService.update(id, data);

  if (!user) {
    return c.json({ error: 'Utilisateur non trouvé' }, 404);
  }

  return c.json({ user });
});

// DELETE /api/v1/users/:id
users.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const currentUser = c.get('user');

  // Users can only delete their own account
  if (currentUser.id !== id) {
    return c.json({ error: 'Non autorisé' }, 403);
  }

  const success = await userService.delete(id);

  if (!success) {
    return c.json({ error: 'Utilisateur non trouvé' }, 404);
  }

  return c.json({ message: 'Utilisateur supprimé' });
});

export default users;
