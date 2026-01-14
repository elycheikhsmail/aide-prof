/**
 * Données de seed pour la base de données
 * Séparées de la logique pour faciliter la maintenance
 */

// Professeur par défaut
export const professorData = {
  name: 'Dr. Marie Dubois',
  email: 'marie.dubois@school.fr',
  password: '1234',
  role: 'professor' as const,
};

// Matières disponibles
export const subjectsData = [
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

// Classes (professorId sera ajouté dynamiquement)
export const classesData = [
  { name: 'Mathématiques A', subject: 'Mathématiques' },
  { name: 'Physique B', subject: 'Physique' },
  { name: 'Chimie C', subject: 'Chimie' },
];

// Évaluations (professorId sera ajouté dynamiquement)
export const evaluationsData = [
  {
    title: 'Contrôle Algèbre Linéaire',
    subject: 'Mathématiques',
    date: '2024-01-15',
    duration: 120,
    totalPoints: 20,
    status: 'completed' as const,
  },
  {
    title: 'Examen Mécanique',
    subject: 'Physique',
    date: '2024-01-20',
    duration: 90,
    totalPoints: 20,
    status: 'correcting' as const,
  },
  {
    title: 'Quiz Réactions Chimiques',
    subject: 'Chimie',
    date: '2024-01-25',
    duration: 45,
    totalPoints: 10,
    status: 'active' as const,
  },
  {
    title: 'Devoir Probabilités',
    subject: 'Mathématiques',
    date: '2024-02-01',
    duration: 60,
    totalPoints: 20,
    status: 'draft' as const,
  },
];

// Questions pour la première évaluation (evaluationId sera ajouté dynamiquement)
export const questionsData = [
  {
    number: 1,
    statement: 'Résoudre le système linéaire suivant...',
    modelAnswer: 'Solution détaillée avec matrices...',
    points: 5,
    estimatedLines: 10,
  },
  {
    number: 2,
    statement: 'Calculer le déterminant de la matrice A...',
    modelAnswer: 'det(A) = ...',
    points: 5,
    estimatedLines: 8,
  },
  {
    number: 3,
    statement: 'Démontrer que les vecteurs sont linéairement indépendants...',
    modelAnswer: 'Démonstration par le calcul du rang...',
    points: 5,
    estimatedLines: 12,
  },
  {
    number: 4,
    statement: 'Trouver les valeurs propres de la matrice B...',
    modelAnswer: 'λ1 = ..., λ2 = ...',
    points: 5,
    estimatedLines: 15,
  },
];

// Noms des étudiants
export const studentNames = [
  'Lucas Martin',
  'Emma Bernard',
  'Hugo Thomas',
  'Léa Petit',
  'Louis Robert',
  'Chloé Richard',
  'Nathan Durand',
  'Manon Dubois',
  'Théo Moreau',
  'Camille Laurent',
  'Enzo Simon',
  'Sarah Michel',
  'Mathis Lefebvre',
  'Inès Leroy',
  'Raphaël Roux',
  'Jade David',
  'Arthur Bertrand',
  'Louise Morel',
  'Jules Fournier',
  'Alice Girard',
];

// Mot de passe par défaut pour les étudiants
export const studentDefaultPassword = 'student123';

// Configuration pour le calcul des scores
export const studentScoreConfig = {
  baseScore: 16.5,
  decrementPerRank: 0.35,
};
