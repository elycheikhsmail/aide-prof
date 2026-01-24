import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, professorMiddleware } from '../middlewares/auth.middleware.js';
import { pdfService } from '../services/pdf.service.js';
import { storageService } from '../services/storage.service.js';
import { evaluationService } from '../services/evaluation.service.js';
import { evaluationPdfRepository } from '../repositories/evaluationPdf.repository.js';

const pdfRoutes = new Hono();

pdfRoutes.use('*', authMiddleware, professorMiddleware);

const generatePdfSchema = z.object({
  type: z.enum(['combined', 'questions', 'answers']).default('combined'),
});

const pdfTypeSchema = z.enum(['combined', 'questions', 'answers']);

const makeSafeFileName = (value: string) => value.replace(/[^a-z0-9]/gi, '_').slice(0, 120);

pdfRoutes.post('/:id/pdf/generate', zValidator('json', generatePdfSchema), async (c) => {
  const evaluationId = c.req.param('id');
  const { type } = c.req.valid('json');
  const user = c.get('user');

  const evaluation = await evaluationService.findById(evaluationId);
  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  if (evaluation.professorId !== user.id) {
    return c.json({ error: 'Accès refusé' }, 403);
  }

  const pdfBuffer =
    type === 'combined'
      ? await pdfService.generateCombinedSheet(evaluation)
      : type === 'questions'
      ? await pdfService.generateQuestionsSheet(evaluation)
      : await pdfService.generateAnswersSheet(evaluation);

  const safeName = makeSafeFileName(evaluation.title) || 'evaluation';
  const fileName = `evaluations/${evaluationId}/${safeName}_${type}_${Date.now()}.pdf`;
  const fileUrl = await storageService.uploadPdf(fileName, pdfBuffer);

  const existingPdf = await evaluationPdfRepository.findByEvaluationAndType(evaluationId, type);
  if (existingPdf) {
    try {
      await storageService.deleteFile(existingPdf.fileName);
    } catch (error) {
      console.warn('Failed to delete previous PDF from storage:', error);
    }
    await evaluationPdfRepository.updateFile(existingPdf.id, fileName, fileUrl);
  } else {
    await evaluationPdfRepository.create({
      evaluationId,
      type,
      fileName,
      fileUrl,
    });
  }

  return c.json({
    message: 'PDF généré avec succès',
    url: fileUrl,
    type,
  });
});

pdfRoutes.get('/:id/pdf', async (c) => {
  const evaluationId = c.req.param('id');
  const user = c.get('user');
  const typeValue = c.req.query('type') ?? 'combined';
  const parsed = pdfTypeSchema.safeParse(typeValue);

  if (!parsed.success) {
    return c.json({ error: 'Type de PDF invalide' }, 400);
  }

  const evaluation = await evaluationService.findById(evaluationId);
  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  if (evaluation.professorId !== user.id) {
    return c.json({ error: 'Accès refusé' }, 403);
  }

  const pdf = await evaluationPdfRepository.findByEvaluationAndType(evaluationId, parsed.data);
  if (!pdf) {
    return c.json({ error: 'PDF non trouvé. Veuillez le générer d\'abord.' }, 404);
  }

  const freshUrl = await storageService.getFileUrl(pdf.fileName);

  return c.json({
    url: freshUrl,
    type: pdf.type,
    createdAt: pdf.createdAt,
  });
});

pdfRoutes.get('/:id/pdfs', async (c) => {
  const evaluationId = c.req.param('id');
  const user = c.get('user');
  const evaluation = await evaluationService.findById(evaluationId);

  if (!evaluation) {
    return c.json({ error: 'Évaluation non trouvée' }, 404);
  }

  if (evaluation.professorId !== user.id) {
    return c.json({ error: 'Accès refusé' }, 403);
  }

  const pdfs = await evaluationPdfRepository.findByEvaluationId(evaluationId);
  const pdfsWithFreshUrls = await Promise.all(
    pdfs.map(async (pdf) => ({
      ...pdf,
      url: await storageService.getFileUrl(pdf.fileName),
    }))
  );

  return c.json({ pdfs: pdfsWithFreshUrls });
});

export default pdfRoutes;
