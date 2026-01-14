import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users } from './schema/users.js';
import { classes } from './schema/classes.js';
import { evaluations } from './schema/evaluations.js';
import { evaluationClasses } from './schema/evaluationClasses.js';
import { questions } from './schema/questions.js';
import { students } from './schema/students.js';
import { subjects } from './schema/subjects.js';
import {
  professorData,
  subjectsData,
  classesData,
  evaluationsData,
  questionsData,
  studentNames,
  studentDefaultPassword,
  studentScoreConfig,
} from './data.js';

async function createProfessor() {
  const passwordHash = await bcrypt.hash(professorData.password, 10);
  const [professor] = await db
    .insert(users)
    .values({
      name: professorData.name,
      email: professorData.email,
      passwordHash,
      role: professorData.role,
    })
    .returning();
  console.log('Created professor:', professor!.email);
  return professor!;
}

async function createSubjects() {
  await db.insert(subjects).values(subjectsData).onConflictDoNothing();
  console.log('Created subjects');
}

async function createClasses(professorId: string) {
  const classesWithProfessor = classesData.map((c) => ({
    ...c,
    professorId,
  }));
  const createdClasses = await db.insert(classes).values(classesWithProfessor).returning();
  console.log('Created', createdClasses.length, 'classes');
  return createdClasses;
}

async function createEvaluations(professorId: string) {
  const evaluationsWithProfessor = evaluationsData.map((e) => ({
    ...e,
    professorId,
  }));
  const createdEvaluations = await db.insert(evaluations).values(evaluationsWithProfessor).returning();
  console.log('Created', createdEvaluations.length, 'evaluations');
  return createdEvaluations;
}

async function linkEvaluationsToClasses(
  createdEvaluations: { id: string }[],
  createdClasses: { id: string }[]
) {
  await db.insert(evaluationClasses).values([
    { evaluationId: createdEvaluations[0]!.id, classId: createdClasses[0]!.id },
    { evaluationId: createdEvaluations[1]!.id, classId: createdClasses[1]!.id },
    { evaluationId: createdEvaluations[2]!.id, classId: createdClasses[2]!.id },
    { evaluationId: createdEvaluations[3]!.id, classId: createdClasses[0]!.id },
  ]);
  console.log('Linked evaluations to classes');
}

async function createQuestions(evaluationId: string) {
  const questionsWithEvaluation = questionsData.map((q) => ({
    ...q,
    evaluationId,
  }));
  await db.insert(questions).values(questionsWithEvaluation);
  console.log('Created', questionsData.length, 'questions');
}

async function createStudents(classId: string) {
  const studentPasswordHash = await bcrypt.hash(studentDefaultPassword, 10);

  for (const [index, name] of studentNames.entries()) {
    const email = name.toLowerCase().replace(' ', '.') + '@student.school.fr';

    const [studentUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: studentPasswordHash,
        role: 'student',
      })
      .returning();

    const averageScore = (
      studentScoreConfig.baseScore - index * studentScoreConfig.decrementPerRank
    ).toFixed(2);

    await db.insert(students).values({
      userId: studentUser!.id,
      classId,
      averageScore,
      rank: index + 1,
    });
  }
  console.log('Created', studentNames.length, 'students');
}

async function seed() {
  console.log('Seeding database...');

  try {
    const professor = await createProfessor();
    await createSubjects();
    const createdClasses = await createClasses(professor.id);
    const createdEvaluations = await createEvaluations(professor.id);
    await linkEvaluationsToClasses(createdEvaluations, createdClasses);
    await createQuestions(createdEvaluations[0]!.id);
    await createStudents(createdClasses[0]!.id);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
