import { eq, lt } from 'drizzle-orm';
import { db } from '../config/database.js';
import { sessions, type Session, type NewSession } from '../db/schema/sessions.js';
import type { IRepository } from './base.repository.js';

export interface ISessionRepository extends IRepository<Session, NewSession> {
  findByUserId(userId: string): Promise<Session[]>;
  deleteExpired(): Promise<number>;
}

export class SessionRepository implements ISessionRepository {
  async findAll(): Promise<Session[]> {
    return db.select().from(sessions);
  }

  async findById(id: string): Promise<Session | null> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async create(data: NewSession): Promise<Session> {
    const result = await db.insert(sessions).values(data).returning();
    return result[0]!;
  }

  async update(id: string, data: Partial<NewSession>): Promise<Session | null> {
    const result = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id)).returning();
    return result.length > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()))
      .returning();
    return result.length;
  }
}

export const sessionRepository = new SessionRepository();
