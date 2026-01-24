import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { evaluationPdfs, type NewEvaluationPdf } from '../db/schema/evaluationPdfs.js';

class EvaluationPdfRepository {
  async create(data: NewEvaluationPdf) {
    const [pdf] = await db.insert(evaluationPdfs).values(data).returning();
    return pdf;
  }

  async findByEvaluationId(evaluationId: string) {
    return db.select().from(evaluationPdfs).where(eq(evaluationPdfs.evaluationId, evaluationId));
  }

  async findByEvaluationAndType(evaluationId: string, type: 'combined' | 'questions' | 'answers') {
    const [pdf] = await db
      .select()
      .from(evaluationPdfs)
      .where(and(eq(evaluationPdfs.evaluationId, evaluationId), eq(evaluationPdfs.type, type)));
    return pdf;
  }

  async updateFile(id: string, fileName: string, fileUrl: string) {
    const [pdf] = await db
      .update(evaluationPdfs)
      .set({ fileName, fileUrl, updatedAt: new Date() })
      .where(eq(evaluationPdfs.id, id))
      .returning();
    return pdf;
  }

  async updateUrl(id: string, fileUrl: string) {
    const [pdf] = await db
      .update(evaluationPdfs)
      .set({ fileUrl, updatedAt: new Date() })
      .where(eq(evaluationPdfs.id, id))
      .returning();
    return pdf;
  }

  async delete(id: string) {
    await db.delete(evaluationPdfs).where(eq(evaluationPdfs.id, id));
  }
}

export const evaluationPdfRepository = new EvaluationPdfRepository();
