import { classRepository } from '../repositories/class.repository.js';
import { studentRepository } from '../repositories/student.repository.js';
import type { Class } from '../db/schema/classes.js';
import type { CreateClassInput, UpdateClassInput } from '../validators/class.validator.js';

export interface ClassWithStudentCount extends Class {
  studentCount: number;
}

class ClassService {
  async findAll(): Promise<Class[]> {
    return classRepository.findAll();
  }

  async findByProfessorId(professorId: string): Promise<ClassWithStudentCount[]> {
    const classes = await classRepository.findByProfessorId(professorId);

    // Get student count for each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const students = await studentRepository.findByClassId(cls.id);
        return {
          ...cls,
          studentCount: students.length,
        };
      })
    );

    return classesWithCount;
  }

  async findById(id: string): Promise<ClassWithStudentCount | null> {
    const cls = await classRepository.findById(id);
    if (!cls) return null;

    const students = await studentRepository.findByClassId(id);
    return {
      ...cls,
      studentCount: students.length,
    };
  }

  async create(professorId: string, data: CreateClassInput): Promise<Class> {
    return classRepository.create({
      ...data,
      professorId,
    });
  }

  async update(id: string, data: UpdateClassInput): Promise<Class | null> {
    return classRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return classRepository.delete(id);
  }

  async getStudents(classId: string) {
    return studentRepository.findByClassId(classId);
  }
}

export const classService = new ClassService();
