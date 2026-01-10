import { Page } from '@playwright/test';
import type { Evaluation } from '../../../src/types';

/**
 * Helper pour importer une évaluation via l'interface JSON dans l'UI
 * Utilisé dans les tests nécessitant des évaluations complètes
 */
export async function importEvaluationFromJSON(
  page: Page,
  evaluationData: Record<string, unknown>
): Promise<void> {
  // 1. Cliquer sur le bouton "Importer JSON"
  await page.getByTestId('import-evaluation-button').click();

  // 2. Attendre que le modal d'import soit ouvert
  await page.getByTestId('modal-overlay').waitFor();

  // 3. Choisir la méthode "Coller JSON"
  await page.getByTestId('import-method-paste').click();

  // 4. Remplir la textarea avec le JSON
  const jsonString = JSON.stringify(evaluationData, null, 2);
  await page.getByTestId('json-textarea').fill(jsonString);

  // 5. Cliquer sur "Suivant" pour passer à la validation
  await page.getByTestId('import-modal-next').click();

  // 6. Attendre que la validation soit affichée
  await page.getByTestId('evaluation-preview').waitFor();

  // 7. Cliquer sur "Confirmer" pour créer l'évaluation
  await page.getByTestId('import-modal-confirm').click();

  // 8. Attendre que le modal se ferme (vérifier que l'overlay n'est plus visible)
  await page.getByTestId('modal-overlay').waitFor({ state: 'hidden' });
}

/**
 * Helper pour importer une évaluation via upload de fichier
 * @param page - Page Playwright
 * @param evaluationData - Données de l'évaluation
 */
export async function importEvaluationFromFile(
  page: Page,
  evaluationData: Record<string, unknown>
): Promise<void> {
  // 1. Cliquer sur le bouton "Importer JSON"
  await page.getByTestId('import-evaluation-button').click();

  // 2. Attendre que le modal d'import soit ouvert
  await page.getByTestId('modal-overlay').waitFor();

  // 3. Choisir la méthode "Upload fichier"
  await page.getByTestId('import-method-file').click();

  // 4. Créer un fichier temporaire et l'uploader
  const jsonString = JSON.stringify(evaluationData, null, 2);
  const fileInput = page.getByTestId('file-upload-input');

  // Créer un DataTransfer avec le fichier
  await fileInput.setInputFiles({
    name: 'evaluation.json',
    mimeType: 'application/json',
    buffer: Buffer.from(jsonString),
  });

  // 5. Cliquer sur "Suivant" pour passer à la validation
  await page.getByTestId('import-modal-next').click();

  // 6. Attendre que la validation soit affichée
  await page.getByTestId('evaluation-preview').waitFor();

  // 7. Cliquer sur "Confirmer" pour créer l'évaluation
  await page.getByTestId('import-modal-confirm').click();

  // 8. Attendre que le modal se ferme
  await page.getByTestId('modal-overlay').waitFor({ state: 'hidden' });
}

/**
 * Créer des données minimales d'évaluation pour les tests
 * @returns Évaluation minimale valide
 */
export function createMinimalEvaluation(): Evaluation {
  return {
    id: 'test-eval-minimal',
    title: 'Test Évaluation Minimale',
    subject: 'Mathématiques',
    date: '2025-02-01',
    duration: 60,
    totalPoints: 10,
    professorId: 'prof-1',
    classIds: [],
    status: 'draft',
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Question de test',
        modelAnswer: 'Réponse de test',
        points: 10,
        estimatedLines: 5,
      },
    ],
  };
}

/**
 * Créer des données complètes d'évaluation pour les tests
 * @returns Évaluation complète avec plusieurs questions
 */
export function createCompleteEvaluation(): Evaluation {
  return {
    id: 'test-eval-complete',
    title: 'Contrôle Algèbre Linéaire',
    subject: 'Mathématiques',
    date: '2025-01-15',
    duration: 120,
    totalPoints: 20,
    professorId: 'prof-1',
    classIds: ['class-1', 'class-2'],
    status: 'draft',
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Résoudre le système d\'équations suivant par la méthode de Gauss',
        modelAnswer:
          'Étapes: 1) Mise en forme matricielle 2) Réduction échelonnée 3) Solution x=2, y=3, z=1',
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
  };
}

/**
 * Créer des données invalides d'évaluation pour tester la validation
 * @returns Objet invalide pour tester les erreurs de validation
 */
export function createInvalidEvaluation(): Record<string, unknown> {
  return {
    // Titre manquant
    subject: 'Mathématiques',
    date: '2025-03-01',
    duration: 60,
    totalPoints: 15,
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Question test',
        modelAnswer: 'Réponse test',
        points: 15,
        estimatedLines: 5,
      },
    ],
  };
}

/**
 * Créer une évaluation avec des erreurs de cohérence (totalPoints incorrect)
 * @returns Évaluation avec totalPoints ne correspondant pas à la somme des questions
 */
export function createInconsistentEvaluation(): Record<string, unknown> {
  return {
    title: 'Test Points Incorrects',
    subject: 'Physique',
    date: '2025-04-01',
    duration: 90,
    totalPoints: 50, // Devrait être 25
    questions: [
      {
        id: 'q1',
        number: 1,
        statement: 'Question 1',
        modelAnswer: 'Réponse 1',
        points: 10,
        estimatedLines: 5,
      },
      {
        id: 'q2',
        number: 2,
        statement: 'Question 2',
        modelAnswer: 'Réponse 2',
        points: 15,
        estimatedLines: 7,
      },
    ],
  };
}
