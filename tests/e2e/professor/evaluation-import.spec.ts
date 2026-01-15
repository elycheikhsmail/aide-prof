import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';
import {
  importEvaluationFromJSON,
  importEvaluationFromFile,
  createMinimalEvaluation,
  createCompleteEvaluation,
  createInvalidEvaluation,
  createInconsistentEvaluation,
} from '../fixtures/data';

test.describe('Evaluation Import', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should display import button on dashboard', async ({ page }) => {
    // Vérifier que le bouton d'import est visible
    const importButton = page.getByTestId('import-evaluation-button');
    await expect(importButton).toBeVisible();
    await expect(importButton).toContainText('Importer JSON');
  });

  test('should open import modal when clicking import button', async ({ page }) => {
    // Cliquer sur le bouton d'import
    await page.getByTestId('import-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('modal-content')).toBeVisible();

    // Vérifier le titre du modal
    await expect(page.getByTestId('modal-title')).toContainText('Importer une évaluation');

    // Vérifier que les 2 options de méthode sont visibles
    await expect(page.getByTestId('import-method-file')).toBeVisible();
    await expect(page.getByTestId('import-method-paste')).toBeVisible();
  });

  test('should show textarea when selecting paste method', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Cliquer sur "Coller JSON"
    await page.getByTestId('import-method-paste').click();

    // Vérifier que la textarea est visible
    await expect(page.getByTestId('json-textarea')).toBeVisible();

    // Vérifier que le bouton "Changer de méthode" est visible
    await expect(page.getByTestId('change-import-method')).toBeVisible();
  });

  test('should show file upload when selecting file method', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Cliquer sur "Upload fichier"
    await page.getByTestId('import-method-file').click();

    // Vérifier que le composant d'upload est visible
    await expect(page.getByTestId('file-upload-dropzone')).toBeVisible();
  });

  test('should import evaluation successfully via paste method', async ({ page }) => {
    const testEval = createCompleteEvaluation();

    // Importer via la méthode paste
    await importEvaluationFromJSON(page, testEval);

    // Vérifier que l'import a réussi (message dans la console)
    // Note: Dans un vrai projet, on vérifierait que l'évaluation apparaît dans la liste
  });

  test('should show validation errors for invalid JSON', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer un JSON invalide (syntaxe)
    await page.getByTestId('json-textarea').fill('{ invalid json }');

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier que l'aperçu de validation montre des erreurs
    await expect(page.getByTestId('evaluation-preview')).toBeVisible();
    await expect(page.getByTestId('validation-errors')).toBeVisible();

    // Vérifier que le bouton "Confirmer" est désactivé
    await expect(page.getByTestId('import-modal-confirm')).toBeDisabled();
  });

  test('should show validation errors for missing required fields', async ({ page }) => {
    const invalidEval = createInvalidEvaluation();

    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer le JSON invalide
    await page.getByTestId('json-textarea').fill(JSON.stringify(invalidEval, null, 2));

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier que l'aperçu montre des erreurs
    const errorsContainer = page.getByTestId('validation-errors');
    await expect(errorsContainer).toBeVisible();

    // Vérifier qu'il y a au moins une erreur concernant le titre manquant
    await expect(errorsContainer).toContainText(/title/i);

    // Le bouton Confirmer doit être désactivé
    await expect(page.getByTestId('import-modal-confirm')).toBeDisabled();
  });

  test('should show validation errors for inconsistent totalPoints', async ({ page }) => {
    const inconsistentEval = createInconsistentEvaluation();

    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer le JSON avec incohérence
    await page.getByTestId('json-textarea').fill(JSON.stringify(inconsistentEval, null, 2));

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier que l'aperçu montre une erreur d'incohérence
    const errorsContainer = page.getByTestId('validation-errors');
    await expect(errorsContainer).toBeVisible();
    await expect(errorsContainer).toContainText(/incohérence/i);

    // Le bouton Confirmer doit être désactivé
    await expect(page.getByTestId('import-modal-confirm')).toBeDisabled();
  });

  test('should show warnings for optional fields', async ({ page }) => {
    // Créer une évaluation sans professorId et classIds
    const evalWithWarnings = {
      title: 'Test Warnings',
      subject: 'Chimie',
      date: '2025-03-01',
      duration: 60,
      totalPoints: 10,
      questions: [
        {
          id: 'q1',
          number: 1,
          statement: 'Question test',
          modelAnswer: 'Réponse test',
          points: 10,
          estimatedLines: 5,
        },
      ],
    };

    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer le JSON
    await page.getByTestId('json-textarea').fill(JSON.stringify(evalWithWarnings, null, 2));

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier que l'aperçu montre des warnings
    await expect(page.getByTestId('validation-warnings')).toBeVisible();

    // Le bouton Confirmer doit être ACTIF (warnings ne bloquent pas)
    await expect(page.getByTestId('import-modal-confirm')).toBeEnabled();
  });

  test('should display preview of valid evaluation', async ({ page }) => {
    const testEval = createMinimalEvaluation();

    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer le JSON valide
    await page.getByTestId('json-textarea').fill(JSON.stringify(testEval, null, 2));

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier que l'aperçu est visible
    await expect(page.getByTestId('evaluation-preview')).toBeVisible();

    // Vérifier les informations de base
    const basicInfo = page.getByTestId('preview-basic-info');
    await expect(basicInfo).toBeVisible();
    await expect(basicInfo).toContainText(testEval.title);
    await expect(basicInfo).toContainText(testEval.subject);

    // Vérifier les questions
    await expect(page.getByTestId('preview-questions')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('preview-question-0')).toBeVisible({ timeout: 10000 });

    // Le bouton Confirmer doit être actif
    await expect(page.getByTestId('import-modal-confirm')).toBeEnabled();
  });

  test('should navigate back from validation step', async ({ page }) => {
    const testEval = createMinimalEvaluation();

    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Entrer le JSON
    await page.getByTestId('json-textarea').fill(JSON.stringify(testEval, null, 2));

    // Cliquer sur Suivant
    await page.getByTestId('import-modal-next').click();

    // Vérifier qu'on est à l'étape de validation
    await expect(page.getByTestId('evaluation-preview')).toBeVisible();

    // Cliquer sur Retour
    await page.getByTestId('import-modal-back').click();

    // Vérifier qu'on est revenu à l'étape 1
    await expect(page.getByTestId('json-textarea')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Cliquer sur Annuler
    await page.getByTestId('import-modal-cancel').click();

    // Vérifier que le modal est fermé
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should import evaluation via file upload', async ({ page }) => {
    const testEval = createCompleteEvaluation();

    // Importer via la méthode file
    await importEvaluationFromFile(page, testEval);

    // Vérifier que l'import a réussi
    // Note: Dans un vrai projet, on vérifierait que l'évaluation apparaît dans la liste
  });

  test('should change import method after selection', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('import-evaluation-button').click();

    // Choisir la méthode paste
    await page.getByTestId('import-method-paste').click();

    // Vérifier que la textarea est visible
    await expect(page.getByTestId('json-textarea')).toBeVisible();

    // Cliquer sur "Changer de méthode"
    await page.getByTestId('change-import-method').click();

    // Vérifier qu'on est revenu à la sélection de méthode
    await expect(page.getByTestId('import-method-file')).toBeVisible();
    await expect(page.getByTestId('import-method-paste')).toBeVisible();
  });
});
