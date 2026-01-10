import type { User, Class, Evaluation, Student, EvaluationResult } from '../types';

export const mockProfessor: User = {
  id: 'prof-1',
  name: 'Dr. Marie Dubois',
  email: 'marie.dubois@school.fr',
  role: 'professor',
  photo: 'https://i.pravatar.cc/150?img=5',
};

export const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Mathématiques A',
    subject: 'Mathématiques',
    studentCount: 28,
  },
  {
    id: 'class-2',
    name: 'Physique B',
    subject: 'Physique',
    studentCount: 25,
  },
  {
    id: 'class-3',
    name: 'Chimie C',
    subject: 'Chimie',
    studentCount: 22,
  },
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval-1',
    title: 'Contrôle Algèbre Linéaire',
    subject: 'Mathématiques',
    date: '2025-01-15',
    duration: 120,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-1'],
    status: 'completed',
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Résoudre le système d\'équations suivant par la méthode de Gauss',
        modelAnswer: 'Étapes: 1) Mise en forme matricielle 2) Réduction échelonnée 3) Solution x=2, y=3, z=1',
        points: 5,
        estimatedLines: 8,
      },
      {
        id: 'q2',
        number: 2,
        statement: 'Calculer le déterminant de la matrice suivante',
        modelAnswer: 'Utilisation de la règle de Sarrus: det = -6',
        points: 3,
        estimatedLines: 5,
      },
      {
        id: 'q3',
        number: 3,
        statement: 'Démontrer que l\'application est linéaire',
        modelAnswer: 'Vérification des deux propriétés: additivité et homogénéité',
        points: 7,
        estimatedLines: 10,
      },
      {
        id: 'q4',
        number: 4,
        statement: 'Trouver les valeurs propres de la matrice A',
        modelAnswer: 'Résolution de det(A - λI) = 0, valeurs propres: λ1=2, λ2=3, λ3=-1',
        points: 5,
        estimatedLines: 7,
      },
    ],
  },
  {
    id: 'eval-2',
    title: 'Examen Mécanique',
    subject: 'Physique',
    date: '2025-01-20',
    duration: 90,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-2'],
    status: 'correcting',
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Calculer la force résultante appliquée sur le corps',
        modelAnswer: 'F = ma = 10 × 2 = 20 N',
        points: 4,
        estimatedLines: 4,
      },
      {
        id: 'q2',
        number: 2,
        statement: 'Déterminer l\'accélération du mobile',
        modelAnswer: 'a = Δv/Δt = (30-10)/5 = 4 m/s²',
        points: 4,
        estimatedLines: 3,
      },
    ],
  },
  {
    id: 'eval-3',
    title: 'Quiz Réactions Chimiques',
    subject: 'Chimie',
    date: '2025-01-22',
    duration: 60,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-3'],
    status: 'active',
    questions: [],
  },
  {
    id: 'eval-4',
    title: 'Devoir Probabilités',
    subject: 'Mathématiques',
    date: '2025-01-25',
    duration: 120,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-1'],
    status: 'draft',
    questions: [],
  },
  {
    id: 'eval-5',
    title: 'TP Électricité',
    subject: 'Physique',
    date: '2025-01-28',
    duration: 90,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-2'],
    status: 'draft',
    questions: [],
  },
];

export const mockStudents: Student[] = [
  { id: 'stu-1', name: 'Sophie Martin', email: 'sophie.martin@student.fr', classId: 'class-1', averageScore: 16.5, rank: 1 },
  { id: 'stu-2', name: 'Lucas Bernard', email: 'lucas.bernard@student.fr', classId: 'class-1', averageScore: 15.8, rank: 2 },
  { id: 'stu-3', name: 'Emma Dubois', email: 'emma.dubois@student.fr', classId: 'class-1', averageScore: 15.2, rank: 3 },
  { id: 'stu-4', name: 'Hugo Petit', email: 'hugo.petit@student.fr', classId: 'class-1', averageScore: 14.9, rank: 4 },
  { id: 'stu-5', name: 'Léa Robert', email: 'lea.robert@student.fr', classId: 'class-1', averageScore: 14.5, rank: 5 },
  { id: 'stu-6', name: 'Nathan Moreau', email: 'nathan.moreau@student.fr', classId: 'class-1', averageScore: 14.2, rank: 6 },
  { id: 'stu-7', name: 'Chloé Simon', email: 'chloe.simon@student.fr', classId: 'class-1', averageScore: 13.8, rank: 7 },
  { id: 'stu-8', name: 'Thomas Laurent', email: 'thomas.laurent@student.fr', classId: 'class-1', averageScore: 13.5, rank: 8 },
  { id: 'stu-9', name: 'Camille Lefebvre', email: 'camille.lefebvre@student.fr', classId: 'class-1', averageScore: 13.1, rank: 9 },
  { id: 'stu-10', name: 'Louis Roux', email: 'louis.roux@student.fr', classId: 'class-1', averageScore: 12.8, rank: 10 },
  { id: 'stu-11', name: 'Manon Fournier', email: 'manon.fournier@student.fr', classId: 'class-1', averageScore: 12.5, rank: 11 },
  { id: 'stu-12', name: 'Gabriel Morel', email: 'gabriel.morel@student.fr', classId: 'class-1', averageScore: 12.2, rank: 12 },
  { id: 'stu-13', name: 'Sarah Girard', email: 'sarah.girard@student.fr', classId: 'class-1', averageScore: 11.9, rank: 13 },
  { id: 'stu-14', name: 'Antoine Andre', email: 'antoine.andre@student.fr', classId: 'class-1', averageScore: 11.6, rank: 14 },
  { id: 'stu-15', name: 'Julie Mercier', email: 'julie.mercier@student.fr', classId: 'class-1', averageScore: 11.3, rank: 15 },
  { id: 'stu-16', name: 'Maxime Blanc', email: 'maxime.blanc@student.fr', classId: 'class-1', averageScore: 11.0, rank: 16 },
  { id: 'stu-17', name: 'Clara Garnier', email: 'clara.garnier@student.fr', classId: 'class-1', averageScore: 10.7, rank: 17 },
  { id: 'stu-18', name: 'Arthur Faure', email: 'arthur.faure@student.fr', classId: 'class-1', averageScore: 10.4, rank: 18 },
  { id: 'stu-19', name: 'Lucie Vincent', email: 'lucie.vincent@student.fr', classId: 'class-1', averageScore: 10.1, rank: 19 },
  { id: 'stu-20', name: 'Alexandre Bonnet', email: 'alexandre.bonnet@student.fr', classId: 'class-1', averageScore: 9.8, rank: 20 },
];

export const mockEvaluationResults: EvaluationResult[] = mockStudents.slice(0, 10).map((student, index) => ({
  evaluationId: 'eval-1',
  studentId: student.id,
  studentName: student.name,
  score: 19 - index * 1.2,
  maxScore: 20,
  rank: index + 1,
  progress: ((19 - index * 1.2) / 20 * 100) - 70, // Par rapport à la moyenne de 70%
}));

export const mockStatistics = {
  totalEvaluations: 12,
  activeClasses: 3,
  copiesToCorrect: 45,
  averageSuccessRate: 72.5,
};

export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'info',
    message: '15 copies en attente de correction pour "Contrôle Algèbre"',
    date: '2025-01-10',
  },
  {
    id: 'notif-2',
    type: 'success',
    message: 'Correction automatique terminée pour "Examen Mécanique"',
    date: '2025-01-09',
  },
  {
    id: 'notif-3',
    type: 'warning',
    message: 'Date limite de correction dans 2 jours pour "Quiz Chimie"',
    date: '2025-01-08',
  },
];
