import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { students, type Student, type NewStudent } from '../db/schema/students.js';
import { users } from '../db/schema/users.js';
import type { IRepository } from './base.repository.js';

export interface StudentWithUser extends Student {
  user: {
    name: string;
    email: string;
  };
}

export interface IStudentRepository extends IRepository<Student, NewStudent> {
  findByClassId(classId: string): Promise<StudentWithUser[]>;
  findByUserId(userId: string): Promise<Student | null>;
}

export class StudentRepository implements IStudentRepository {
  async findAll(): Promise<Student[]> {
    return db.select().from(students);
  }

  async findById(id: string): Promise<Student | null> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0] ?? null;
  }

  async findByClassId(classId: string): Promise<StudentWithUser[]> {
    const result = await db
      .select({
        id: students.id,
        userId: students.userId,
        classId: students.classId,
        averageScore: students.averageScore,
        rank: students.rank,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        user: {
          name: users.name,
          email: users.email,
        },
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.classId, classId));
    return result;
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const result = await db.select().from(students).where(eq(students.userId, userId));
    return result[0] ?? null;
  }

  async create(data: NewStudent): Promise<Student> {
    const result = await db.insert(students).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewStudent>): Promise<Student | null> {
    const result = await db
      .update(students)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id)).returning();
    return result.length > 0;
  }
}

export const studentRepository = new StudentRepository();
