import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, type User, type NewUser } from '../db/schema/users.js';
import type { IRepository } from './base.repository.js';

export interface IUserRepository extends IRepository<User, NewUser> {
  findByEmail(email: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return db.select().from(users);
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}

export const userRepository = new UserRepository();
