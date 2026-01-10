import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { evaluations, type Evaluation, type NewEvaluation } from '../db/schema/evaluations.js';
import { evaluationClasses, type NewEvaluationClass } from '../db/schema/evaluationClasses.js';
import { questions, type Question } from '../db/schema/questions.js';
import type { IRepository } from './base.repository.js';

export interface IEvaluationRepository extends IRepository<Evaluation, NewEvaluation> {
  findByProfessorId(professorId: string): Promise<Evaluation[]>;
  findWithQuestions(id: string): Promise<(Evaluation & { questions: Question[] }) | null>;
  addClassToEvaluation(data: NewEvaluationClass): Promise<void>;
  removeClassFromEvaluation(evaluationId: string, classId: string): Promise<void>;
  getEvaluationClasses(evaluationId: string): Promise<string[]>;
}

export class EvaluationRepository implements IEvaluationRepository {
  async findAll(): Promise<Evaluation[]> {
    return db.select().from(evaluations);
  }

  async findById(id: string): Promise<Evaluation | null> {
    const result = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return result[0] ?? null;
  }

  async findByProfessorId(professorId: string): Promise<Evaluation[]> {
    return db.select().from(evaluations).where(eq(evaluations.professorId, professorId));
  }

  async findWithQuestions(id: string): Promise<(Evaluation & { questions: Question[] }) | null> {
    const evaluation = await this.findById(id);
    if (!evaluation) return null;

    const evalQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.evaluationId, id));

    return { ...evaluation, questions: evalQuestions };
  }

  async create(data: NewEvaluation): Promise<Evaluation> {
    const result = await db.insert(evaluations).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewEvaluation>): Promise<Evaluation | null> {
    const result = await db
      .update(evaluations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(evaluations.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(evaluations).where(eq(evaluations.id, id)).returning();
    return result.length > 0;
  }

  async addClassToEvaluation(data: NewEvaluationClass): Promise<void> {
    await db.insert(evaluationClasses).values(data);
  }

  async removeClassFromEvaluation(evaluationId: string, classId: string): Promise<void> {
    await db
      .delete(evaluationClasses)
      .where(
        and(
          eq(evaluationClasses.evaluationId, evaluationId),
          eq(evaluationClasses.classId, classId)
        )
      );
  }

  async getEvaluationClasses(evaluationId: string): Promise<string[]> {
    const result = await db
      .select({ classId: evaluationClasses.classId })
      .from(evaluationClasses)
      .where(eq(evaluationClasses.evaluationId, evaluationId));
    return result.map((r) => r.classId);
  }
}

export const evaluationRepository = new EvaluationRepository();
