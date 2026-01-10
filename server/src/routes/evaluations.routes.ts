import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { evaluationService } from '../services/evaluation.service.js';
import {
  createEvaluationSchema,
  updateEvaluationSchema,
  createQuestionSchema,
} from '../validators/evaluation.validator.js';
import { authMiddleware, professorMiddleware } from '../middlewares/auth.middleware.js';

const evaluations = new Hono();

// All routes require authentication
evaluations.use('*', authMiddleware);

// GET /api/v1/evaluations - Get professor's evaluations
evaluations.get('/', professorMiddleware, async (c) => {
  const user = c.get('user');
  const evaluationList = await evaluationService.findByProfessorId(user.id);
  return c.json({ evaluations: evaluationList });
});

// POST /api/v1/evaluations - Create an evaluation
evaluations.post('/', professorMiddleware, zValidator('json', createEvaluationSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const evaluation = await evaluationService.create(user.id, data);
  return c.json({ evaluation }, 201);
});

// GET /api/v1/evaluations/:id - Get evaluation details
evaluations.get('/:id', async (c) => {
  const id = c.req.param('id');
  const evaluation = await evaluationService.findById(id);

  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  return c.json({ evaluation });
});

// PATCH /api/v1/evaluations/:id - Update an evaluation
evaluations.patch('/:id', professorMiddleware, zValidator('json', updateEvaluationSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const evaluation = await evaluationService.update(id, data);

  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  return c.json({ evaluation });
});

// DELETE /api/v1/evaluations/:id - Delete an evaluation
evaluations.delete('/:id', professorMiddleware, async (c) => {
  const id = c.req.param('id');
  const success = await evaluationService.delete(id);

  if (!success) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  return c.json({ message: 'Évaluation supprimée' });
});

// GET /api/v1/evaluations/:id/questions - Get evaluation questions
evaluations.get('/:id/questions', async (c) => {
  const id = c.req.param('id');
  const evaluation = await evaluationService.findById(id);

  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  const questions = await evaluationService.getQuestions(id);
  return c.json({ questions });
});

// POST /api/v1/evaluations/:id/questions - Add a question
evaluations.post('/:id/questions', professorMiddleware, zValidator('json', createQuestionSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const evaluation = await evaluationService.findById(id);
  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  const question = await evaluationService.addQuestion(id, data);
  return c.json({ question }, 201);
});

// GET /api/v1/evaluations/:id/copies - Get student copies
evaluations.get('/:id/copies', professorMiddleware, async (c) => {
  const id = c.req.param('id');
  const evaluation = await evaluationService.findById(id);

  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  const copies = await evaluationService.getCopies(id);
  return c.json({ copies });
});

export default evaluations;
