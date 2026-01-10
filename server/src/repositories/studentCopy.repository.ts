import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { studentCopies, type StudentCopy, type NewStudentCopy } from '../db/schema/studentCopies.js';
import type { IRepository } from './base.repository.js';

export interface IStudentCopyRepository extends IRepository<StudentCopy, NewStudentCopy> {
  findByEvaluationId(evaluationId: string): Promise<StudentCopy[]>;
  findByStudentId(studentId: string): Promise<StudentCopy[]>;
  findByEvaluationAndStudent(evaluationId: string, studentId: string): Promise<StudentCopy | null>;
}

export class StudentCopyRepository implements IStudentCopyRepository {
  async findAll(): Promise<StudentCopy[]> {
    return db.select().from(studentCopies);
  }

  async findById(id: string): Promise<StudentCopy | null> {
    const result = await db.select().from(studentCopies).where(eq(studentCopies.id, id));
    return result[0] ?? null;
  }

  async findByEvaluationId(evaluationId: string): Promise<StudentCopy[]> {
    return db.select().from(studentCopies).where(eq(studentCopies.evaluationId, evaluationId));
  }

  async findByStudentId(studentId: string): Promise<StudentCopy[]> {
    return db.select().from(studentCopies).where(eq(studentCopies.studentId, studentId));
  }

  async findByEvaluationAndStudent(evaluationId: string, studentId: string): Promise<StudentCopy | null> {
    const result = await db
      .select()
      .from(studentCopies)
      .where(
        and(
          eq(studentCopies.evaluationId, evaluationId),
          eq(studentCopies.studentId, studentId)
        )
      );
    return result[0] ?? null;
  }

  async create(data: NewStudentCopy): Promise<StudentCopy> {
    const result = await db.insert(studentCopies).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewStudentCopy>): Promise<StudentCopy | null> {
    const result = await db
      .update(studentCopies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentCopies.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(studentCopies).where(eq(studentCopies.id, id)).returning();
    return result.length > 0;
  }
}

export const studentCopyRepository = new StudentCopyRepository();
