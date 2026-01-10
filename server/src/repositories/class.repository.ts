import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { classes, type Class, type NewClass } from '../db/schema/classes.js';
import type { IRepository } from './base.repository.js';

export interface IClassRepository extends IRepository<Class, NewClass> {
  findByProfessorId(professorId: string): Promise<Class[]>;
}

export class ClassRepository implements IClassRepository {
  async findAll(): Promise<Class[]> {
    return db.select().from(classes);
  }

  async findById(id: string): Promise<Class | null> {
    const result = await db.select().from(classes).where(eq(classes.id, id));
    return result[0] ?? null;
  }

  async findByProfessorId(professorId: string): Promise<Class[]> {
    return db.select().from(classes).where(eq(classes.professorId, professorId));
  }

  async create(data: NewClass): Promise<Class> {
    const result = await db.insert(classes).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewClass>): Promise<Class | null> {
    const result = await db
      .update(classes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id)).returning();
    return result.length > 0;
  }
}

export const classRepository = new ClassRepository();
