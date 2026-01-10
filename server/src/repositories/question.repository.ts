import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { questions, type Question, type NewQuestion } from '../db/schema/questions.js';
import type { IRepository } from './base.repository.js';

export interface IQuestionRepository extends IRepository<Question, NewQuestion> {
  findByEvaluationId(evaluationId: string): Promise<Question[]>;
}

export class QuestionRepository implements IQuestionRepository {
  async findAll(): Promise<Question[]> {
    return db.select().from(questions);
  }

  async findById(id: string): Promise<Question | null> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0] ?? null;
  }

  async findByEvaluationId(evaluationId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.evaluationId, evaluationId));
  }

  async create(data: NewQuestion): Promise<Question> {
    const result = await db.insert(questions).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewQuestion>): Promise<Question | null> {
    const result = await db
      .update(questions)
      .set(data)
      .where(eq(questions.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(questions).where(eq(questions.id, id)).returning();
    return result.length > 0;
  }
}

export const questionRepository = new QuestionRepository();
