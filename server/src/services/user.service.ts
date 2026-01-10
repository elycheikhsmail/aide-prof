import { userRepository } from '../repositories/user.repository.js';
import type { User } from '../db/schema/users.js';
import type { UpdateUserInput } from '../validators/user.validator.js';

class UserService {
  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await userRepository.findAll();
    return users.map(({ passwordHash: _, ...user }) => user);
  }

  async findById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: UpdateUserInput): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await userRepository.update(id, data);
    if (!user) return null;

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<boolean> {
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
