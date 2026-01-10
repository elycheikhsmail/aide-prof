import type { Evaluation } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: Partial<Evaluation>;
}

/**
 * Valide le JSON d'une évaluation et retourne un résultat de validation
 * @param jsonString - Chaîne JSON à valider
 * @returns Résultat de validation avec erreurs, warnings et données parsées
 */
export function validateEvaluationJSON(jsonString: string): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    data: {},
  };

  // 1. Validation du JSON syntaxiquement correct
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    result.errors.push(
      `JSON invalide : ${error instanceof Error ? error.message : 'Erreur de parsing'}`
    );
    return result;
  }

  // Vérifier que c'est un objet
  if (typeof parsedData !== 'object' || parsedData === null || Array.isArray(parsedData)) {
    result.errors.push('Le JSON doit être un objet');
    return result;
  }

  const data = parsedData as Record<string, unknown>;
  result.data = data as Partial<Evaluation>;

  // 2. Validation des champs requis
  const requiredFields = ['title', 'subject', 'date', 'duration', 'totalPoints', 'questions'];

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      result.errors.push(`Champ requis manquant : ${field}`);
    }
  }

  // Si des champs requis manquent, arrêter la validation ici
  if (result.errors.length > 0) {
    return result;
  }

  // 3. Validation des types
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    result.errors.push('Le titre doit être une chaîne non vide');
  }

  if (typeof data.subject !== 'string' || data.subject.trim() === '') {
    result.errors.push('La matière doit être une chaîne non vide');
  }

  if (typeof data.date !== 'string') {
    result.errors.push('La date doit être une chaîne');
  } else if (!isValidDate(data.date)) {
    result.errors.push('La date doit être au format ISO (YYYY-MM-DD)');
  }

  // Accepter duration comme string ou number
  if (typeof data.duration === 'string') {
    const durationNum = parseFloat(data.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      result.errors.push('La durée doit être un nombre positif (en minutes)');
    } else {
      data.duration = durationNum; // Convertir en number
    }
  } else if (typeof data.duration !== 'number' || data.duration <= 0) {
    result.errors.push('La durée doit être un nombre positif (en minutes)');
  }

  if (typeof data.totalPoints !== 'number' || data.totalPoints <= 0) {
    result.errors.push('Le total des points doit être un nombre positif');
  }

  if (!Array.isArray(data.questions)) {
    result.errors.push('Les questions doivent être un tableau');
  } else {
    // Validation de chaque question
    const questionsErrors = validateQuestions(data.questions);
    result.errors.push(...questionsErrors);

    // Vérification de la cohérence totalPoints
    if (typeof data.totalPoints === 'number' && data.questions.length > 0) {
      const calculatedTotal = data.questions.reduce(
        (sum: number, q: unknown) =>
          sum + (typeof q === 'object' && q !== null && 'points' in q ? (q.points as number) : 0),
        0
      );

      if (calculatedTotal !== data.totalPoints) {
        result.errors.push(
          `Incohérence : totalPoints (${data.totalPoints}) ne correspond pas à la somme des points des questions (${calculatedTotal})`
        );
      }
    }
  }

  // 4. Warnings pour les champs optionnels
  if (!data.id) {
    result.warnings.push('Aucun ID fourni, un ID sera généré automatiquement');
  }

  if (!data.professorId) {
    result.warnings.push('Aucun professorId fourni, le professeur actuel sera assigné');
  }

  if (!data.status) {
    result.warnings.push("Aucun statut fourni, le statut sera défini sur 'draft'");
  } else if (
    typeof data.status === 'string' &&
    !['draft', 'active', 'correcting', 'completed'].includes(data.status)
  ) {
    result.errors.push(
      "Le statut doit être l'une des valeurs : 'draft', 'active', 'correcting', 'completed'"
    );
  }

  if (!data.classIds || (Array.isArray(data.classIds) && data.classIds.length === 0)) {
    result.warnings.push('Aucune classe assignée, vous pourrez en ajouter plus tard');
  } else if (!Array.isArray(data.classIds)) {
    result.errors.push('classIds doit être un tableau');
  } else if (!data.classIds.every((id: unknown) => typeof id === 'string')) {
    result.errors.push('Tous les éléments de classIds doivent être des chaînes');
  }

  // 5. Déterminer si la validation est réussie
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Valide un tableau de questions
 * @param questions - Tableau de questions à valider
 * @returns Tableau d'erreurs de validation
 */
function validateQuestions(questions: unknown[]): string[] {
  const errors: string[] = [];

  if (questions.length === 0) {
    errors.push("L'évaluation doit contenir au moins une question");
    return errors;
  }

  questions.forEach((question, index) => {
    if (typeof question !== 'object' || question === null) {
      errors.push(`Question ${index + 1} : doit être un objet`);
      return;
    }

    const q = question as Record<string, unknown>;
    const questionNumber = index + 1;

    // Normaliser: si "text" existe, le copier vers "statement"
    if ('text' in q && !('statement' in q)) {
      q.statement = q.text;
    }

    // Champs requis pour une question (id, statement/text, points)
    const requiredQuestionFields = ['id', 'points'];

    for (const field of requiredQuestionFields) {
      if (!(field in q) || q[field] === undefined || q[field] === null) {
        errors.push(`Question ${questionNumber} : champ requis manquant : ${field}`);
      }
    }

    // Vérifier que statement OU text est présent
    if (!('statement' in q) && !('text' in q)) {
      errors.push(`Question ${questionNumber} : champ requis manquant : statement ou text`);
    }

    // Validation des types
    if ('id' in q && typeof q.id !== 'string' && typeof q.id !== 'number') {
      errors.push(`Question ${questionNumber} : l'id doit être une chaîne ou un nombre`);
    } else if ('id' in q && typeof q.id === 'number') {
      q.id = String(q.id); // Convertir en string si c'est un number
    }

    if ('number' in q && typeof q.number !== 'number') {
      errors.push(`Question ${questionNumber} : le numéro doit être un nombre`);
    }

    // Valider statement (ou text)
    const statementValue = q.statement || q.text;
    if (statementValue && (typeof statementValue !== 'string' || (statementValue as string).trim() === '')) {
      errors.push(`Question ${questionNumber} : l'énoncé doit être une chaîne non vide`);
    }

    if ('points' in q && (typeof q.points !== 'number' || q.points <= 0)) {
      errors.push(`Question ${questionNumber} : les points doivent être un nombre positif`);
    }

    // Champs optionnels - juste vérifier le type s'ils existent
    if ('modelAnswer' in q && typeof q.modelAnswer !== 'string') {
      errors.push(`Question ${questionNumber} : la réponse modèle doit être une chaîne`);
    }

    if ('estimatedLines' in q && (typeof q.estimatedLines !== 'number' || q.estimatedLines <= 0)) {
      errors.push(
        `Question ${questionNumber} : estimatedLines doit être un nombre positif`
      );
    }
  });

  return errors;
}

/**
 * Valide une date au format ISO (YYYY-MM-DD)
 * @param dateString - Chaîne de date à valider
 * @returns true si la date est valide, false sinon
 */
function isValidDate(dateString: string): boolean {
  // Format ISO : YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  // Vérifier que c'est une date valide
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Normalise les données d'évaluation en ajoutant les champs manquants
 * @param data - Données partielles de l'évaluation
 * @returns Évaluation complète avec valeurs par défaut
 */
export function normalizeEvaluationData(data: Partial<Evaluation>): Evaluation {
  // Normaliser les questions
  const normalizedQuestions = (data.questions || []).map((q, index) => {
    const question = q as unknown as Record<string, unknown>;

    // Utiliser "text" comme "statement" si statement n'existe pas
    const statement = (question.statement || question.text || '') as string;

    return {
      id: String(question.id || `q${index + 1}`),
      number: (question.number || index + 1) as number,
      statement: statement,
      modelAnswer: (question.modelAnswer || '') as string,
      points: (question.points || 0) as number,
      estimatedLines: (question.estimatedLines || 5) as number,
    };
  });

  return {
    id: data.id || `eval-${Date.now()}`,
    title: data.title || '',
    subject: data.subject || '',
    date: data.date || new Date().toISOString().split('T')[0],
    duration: typeof data.duration === 'string' ? parseFloat(data.duration) : (data.duration || 60),
    totalPoints: data.totalPoints || 0,
    professorId: data.professorId || 'prof-1', // TODO: Récupérer depuis le contexte utilisateur
    classIds: data.classIds || [],
    status: data.status || 'draft',
    questions: normalizedQuestions,
  };
}
