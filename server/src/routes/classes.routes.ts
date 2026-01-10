import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { classService } from '../services/class.service.js';
import { createClassSchema, updateClassSchema } from '../validators/class.validator.js';
import { authMiddleware, professorMiddleware } from '../middlewares/auth.middleware.js';

const classes = new Hono();

// All routes require authentication
classes.use('*', authMiddleware);

// GET /api/v1/classes - Get professor's classes
classes.get('/', professorMiddleware, async (c) => {
  const user = c.get('user');
  const classList = await classService.findByProfessorId(user.id);
  return c.json({ classes: classList });
});

// POST /api/v1/classes - Create a class
classes.post('/', professorMiddleware, zValidator('json', createClassSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const newClass = await classService.create(user.id, data);
  return c.json({ class: newClass }, 201);
});

// GET /api/v1/classes/:id - Get class details
classes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const classData = await classService.findById(id);

  if (!classData) {
    return c.json({ error: 'Classe non trouvée' }, 404);
  }

  return c.json({ class: classData });
});

// PATCH /api/v1/classes/:id - Update a class
classes.patch('/:id', professorMiddleware, zValidator('json', updateClassSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const updatedClass = await classService.update(id, data);

  if (!updatedClass) {
    return c.json({ error: 'Classe non trouvée' }, 404);
  }

  return c.json({ class: updatedClass });
});

// DELETE /api/v1/classes/:id - Delete a class
classes.delete('/:id', professorMiddleware, async (c) => {
  const id = c.req.param('id');
  const success = await classService.delete(id);

  if (!success) {
    return c.json({ error: 'Classe non trouvée' }, 404);
  }

  return c.json({ message: 'Classe supprimée' });
});

// GET /api/v1/classes/:id/students - Get students in a class
classes.get('/:id/students', async (c) => {
  const id = c.req.param('id');
  const classData = await classService.findById(id);

  if (!classData) {
    return c.json({ error: 'Classe non trouvée' }, 404);
  }

  const students = await classService.getStudents(id);
  return c.json({ students });
});

export default classes;
