import { db } from '../config/database';
import { users, classes, evaluations } from './schema';
import bcrypt from 'bcryptjs';

async function seedTestDatabase() {
  console.log('🧪 Seeding test database...');

  // Nettoyer la base de données de test
  await db.delete(evaluations);
  await db.delete(classes);
  await db.delete(users);

  // Créer l'utilisateur de test
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  const [testUser] = await db.insert(users).values({
    name: 'Dr. Marie Dubois',
    email: 'ely@gmail.com',
    passwordHash: hashedPassword,
    role: 'professor',
  }).returning();

  if (!testUser) {
    throw new Error('Failed to create test user');
  }

  console.log('✅ Test user created:', testUser.email);

  // Créer des classes de test
  const [testClass] = await db.insert(classes).values({
    name: 'Mathématiques A',
    subject: 'Mathématiques',
    professorId: testUser.id,
  }).returning();

  if (!testClass) {
    throw new Error('Failed to create test class');
  }

  console.log('✅ Test class created:', testClass.name);

  // Créer des évaluations de test
  await db.insert(evaluations).values([
    {
      title: 'Contrôle Algèbre Linéaire',
      subject: 'Mathématiques',
      date: '2025-01-15',
      duration: 120,
      totalPoints: 20,
      professorId: testUser.id,
      status: 'completed',
    },
    {
      title: 'Examen Mécanique',
      subject: 'Physique',
      date: '2025-01-20',
      duration: 90,
      totalPoints: 20,
      professorId: testUser.id,
      status: 'correcting',
    },
  ]);

  console.log('✅ Test evaluations created');
  console.log('🎉 Test database seeded successfully!');
  
  process.exit(0);
}

seedTestDatabase().catch((error) => {
  console.error('❌ Error seeding test database:', error);
  process.exit(1);
});
