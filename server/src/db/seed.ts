import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users } from './schema/users.js';
import { classes } from './schema/classes.js';
import { evaluations } from './schema/evaluations.js';
import { evaluationClasses } from './schema/evaluationClasses.js';
import { questions } from './schema/questions.js';
import { students } from './schema/students.js';
import { subjects } from './schema/subjects.js';

async function seed() {
  console.log('Seeding database...');

  try {
    // Create professor
    const passwordHash = await bcrypt.hash('1234', 10);
    const [professor] = await db
      .insert(users)
      .values({
        name: 'Dr. Marie Dubois',
        email: 'marie.dubois@school.fr',
        passwordHash,
        role: 'professor',
      })
      .returning();
    console.log('Created professor:', professor!.email);

    // Create subjects
    const subjectsData = [
      { code: 'math', label: 'Mathématiques' },
      { code: 'physics', label: 'Physique' },
      { code: 'chemistry', label: 'Chimie' },
      { code: 'french', label: 'Français' },
      { code: 'history-geo', label: 'Histoire-Géo' },
      { code: 'english', label: 'Anglais' },
      { code: 'spanish', label: 'Espagnol' },
      { code: 'svt', label: 'SVT' },
      { code: 'technology', label: 'Technologie' },
    ];

    await db.insert(subjects).values(subjectsData).onConflictDoNothing();
    console.log('Created subjects');

    // Create classes
    const classesData = [
      { name: 'Mathématiques A', subject: 'Mathématiques', professorId: professor!.id },
      { name: 'Physique B', subject: 'Physique', professorId: professor!.id },
      { name: 'Chimie C', subject: 'Chimie', professorId: professor!.id },
    ];

    const createdClasses = await db.insert(classes).values(classesData).returning();
    console.log('Created', createdClasses.length, 'classes');

    // Create evaluations
    const evaluationsData = [
      {
        title: 'Contrôle Algèbre Linéaire',
        subject: 'Mathématiques',
        date: '2024-01-15',
        duration: 120,
        totalPoints: 20,
        professorId: professor!.id,
        status: 'completed' as const,
      },
      {
        title: 'Examen Mécanique',
        subject: 'Physique',
        date: '2024-01-20',
        duration: 90,
        totalPoints: 20,
        professorId: professor!.id,
        status: 'correcting' as const,
      },
      {
        title: 'Quiz Réactions Chimiques',
        subject: 'Chimie',
        date: '2024-01-25',
        duration: 45,
        totalPoints: 10,
        professorId: professor!.id,
        status: 'active' as const,
      },
      {
        title: 'Devoir Probabilités',
        subject: 'Mathématiques',
        date: '2024-02-01',
        duration: 60,
        totalPoints: 20,
        professorId: professor!.id,
        status: 'draft' as const,
      },
    ];

    const createdEvaluations = await db.insert(evaluations).values(evaluationsData).returning();
    console.log('Created', createdEvaluations.length, 'evaluations');

    // Link evaluations to classes
    await db.insert(evaluationClasses).values([
      { evaluationId: createdEvaluations[0]!.id, classId: createdClasses[0]!.id },
      { evaluationId: createdEvaluations[1]!.id, classId: createdClasses[1]!.id },
      { evaluationId: createdEvaluations[2]!.id, classId: createdClasses[2]!.id },
      { evaluationId: createdEvaluations[3]!.id, classId: createdClasses[0]!.id },
    ]);
    console.log('Linked evaluations to classes');

    // Create questions for first evaluation
    const questionsData = [
      {
        evaluationId: createdEvaluations[0]!.id,
        number: 1,
        statement: 'Résoudre le système linéaire suivant...',
        modelAnswer: 'Solution détaillée avec matrices...',
        points: 5,
        estimatedLines: 10,
      },
      {
        evaluationId: createdEvaluations[0]!.id,
        number: 2,
        statement: 'Calculer le déterminant de la matrice A...',
        modelAnswer: 'det(A) = ...',
        points: 5,
        estimatedLines: 8,
      },
      {
        evaluationId: createdEvaluations[0]!.id,
        number: 3,
        statement: 'Démontrer que les vecteurs sont linéairement indépendants...',
        modelAnswer: 'Démonstration par le calcul du rang...',
        points: 5,
        estimatedLines: 12,
      },
      {
        evaluationId: createdEvaluations[0]!.id,
        number: 4,
        statement: 'Trouver les valeurs propres de la matrice B...',
        modelAnswer: 'λ1 = ..., λ2 = ...',
        points: 5,
        estimatedLines: 15,
      },
    ];

    await db.insert(questions).values(questionsData);
    console.log('Created', questionsData.length, 'questions');

    // Create students
    const studentNames = [
      'Lucas Martin', 'Emma Bernard', 'Hugo Thomas', 'Léa Petit', 'Louis Robert',
      'Chloé Richard', 'Nathan Durand', 'Manon Dubois', 'Théo Moreau', 'Camille Laurent',
      'Enzo Simon', 'Sarah Michel', 'Mathis Lefebvre', 'Inès Leroy', 'Raphaël Roux',
      'Jade David', 'Arthur Bertrand', 'Louise Morel', 'Jules Fournier', 'Alice Girard',
    ];

    for (const [index, name] of studentNames.entries()) {
      const studentPasswordHash = await bcrypt.hash('student123', 10);
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

      await db.insert(students).values({
        userId: studentUser!.id,
        classId: createdClasses[0]!.id,
        averageScore: (16.5 - index * 0.35).toFixed(2),
        rank: index + 1,
      });
    }
    console.log('Created', studentNames.length, 'students');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
