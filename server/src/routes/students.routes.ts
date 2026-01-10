import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { studentService } from '../services/student.service.js';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator.js';
import { authMiddleware, professorMiddleware } from '../middlewares/auth.middleware.js';

const students = new Hono();

// All routes require authentication
students.use('*', authMiddleware);

// GET /api/v1/students - Get all students (professor only)
students.get('/', professorMiddleware, async (c) => {
  const studentList = await studentService.findAll();
  return c.json({ students: studentList });
});

// POST /api/v1/students - Create a student (professor only)
students.post('/', professorMiddleware, zValidator('json', createStudentSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const student = await studentService.create(data);
    return c.json({ student }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création';
    return c.json({ error: message }, 400);
  }
});

// GET /api/v1/students/:id - Get student details
students.get('/:id', async (c) => {
  const id = c.req.param('id');
  const student = await studentService.findById(id);

  if (!student) {
    return c.json({ error: 'Étudiant non trouvé' }, 404);
  }

  return c.json({ student });
});

// PATCH /api/v1/students/:id - Update a student (professor only)
students.patch('/:id', professorMiddleware, zValidator('json', updateStudentSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const student = await studentService.update(id, data);

  if (!student) {
    return c.json({ error: 'Étudiant non trouvé' }, 404);
  }

  return c.json({ student });
});

// DELETE /api/v1/students/:id - Delete a student (professor only)
students.delete('/:id', professorMiddleware, async (c) => {
  const id = c.req.param('id');
  const success = await studentService.delete(id);

  if (!success) {
    return c.json({ error: 'Étudiant non trouvé' }, 404);
  }

  return c.json({ message: 'Étudiant supprimé' });
});

// GET /api/v1/students/:id/results - Get student results
students.get('/:id/results', async (c) => {
  const id = c.req.param('id');
  const student = await studentService.findById(id);

  if (!student) {
    return c.json({ error: 'Étudiant non trouvé' }, 404);
  }

  const results = await studentService.getResults(id);
  return c.json({ results });
});

export default students;
