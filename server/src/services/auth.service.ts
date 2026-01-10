import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/user.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import type { User } from '../db/schema/users.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { env } from '../config/env.js';

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  sessionId: string;
}

class AuthService {
  async register(data: RegisterInput): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    // Create session
    const sessionId = await this.createSession(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, sessionId };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Create session
    const sessionId = await this.createSession(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, sessionId };
  }

  async logout(sessionId: string): Promise<void> {
    await sessionRepository.delete(sessionId);
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async createSession(userId: string): Promise<string> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE);

    await sessionRepository.create({
      id: sessionId,
      userId,
      expiresAt,
    });

    return sessionId;
  }
}

export const authService = new AuthService();
