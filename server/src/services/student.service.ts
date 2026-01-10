import { studentRepository, type StudentWithUser } from '../repositories/student.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { studentCopyRepository } from '../repositories/studentCopy.repository.js';
import type { Student } from '../db/schema/students.js';
import type { CreateStudentInput, UpdateStudentInput } from '../validators/student.validator.js';
import bcrypt from 'bcryptjs';

class StudentService {
  async findAll(): Promise<Student[]> {
    return studentRepository.findAll();
  }

  async findById(id: string): Promise<Student | null> {
    return studentRepository.findById(id);
  }

  async findByClassId(classId: string): Promise<StudentWithUser[]> {
    return studentRepository.findByClassId(classId);
  }

  async create(data: CreateStudentInput): Promise<Student> {
    // Create user account for student
    const passwordHash = await bcrypt.hash('student123', 10); // Default password

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'student',
    });

    // Create student record
    return studentRepository.create({
      userId: user.id,
      classId: data.classId,
    });
  }

  async update(id: string, data: UpdateStudentInput): Promise<Student | null> {
    // Convert averageScore to string for decimal field
    const updateData = {
      ...data,
      averageScore: data.averageScore?.toString(),
    };
    return studentRepository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const student = await studentRepository.findById(id);
    if (!student) return false;

    // Delete student record (user will be cascade deleted if needed)
    return studentRepository.delete(id);
  }

  async getResults(studentId: string) {
    return studentCopyRepository.findByStudentId(studentId);
  }
}

export const studentService = new StudentService();
