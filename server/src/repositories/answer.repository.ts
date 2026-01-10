import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { answers, type Answer, type NewAnswer } from '../db/schema/answers.js';
import type { IRepository } from './base.repository.js';

export interface IAnswerRepository extends IRepository<Answer, NewAnswer> {
  findByStudentCopyId(studentCopyId: string): Promise<Answer[]>;
  findByQuestionId(questionId: string): Promise<Answer[]>;
}

export class AnswerRepository implements IAnswerRepository {
  async findAll(): Promise<Answer[]> {
    return db.select().from(answers);
  }

  async findById(id: string): Promise<Answer | null> {
    const result = await db.select().from(answers).where(eq(answers.id, id));
    return result[0] ?? null;
  }

  async findByStudentCopyId(studentCopyId: string): Promise<Answer[]> {
    return db.select().from(answers).where(eq(answers.studentCopyId, studentCopyId));
  }

  async findByQuestionId(questionId: string): Promise<Answer[]> {
    return db.select().from(answers).where(eq(answers.questionId, questionId));
  }

  async create(data: NewAnswer): Promise<Answer> {
    const result = await db.insert(answers).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewAnswer>): Promise<Answer | null> {
    const result = await db
      .update(answers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(answers.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(answers).where(eq(answers.id, id)).returning();
    return result.length > 0;
  }
}

export const answerRepository = new AnswerRepository();
