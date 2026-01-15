import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Professor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should display dashboard title and subtitle', async ({ page }) => {
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
    await expect(page.getByTestId('dashboard-subtitle')).toBeVisible();
  });

  test('should display all statistics cards', async ({ page }) => {
    // Vérifier que les 4 cartes de statistiques sont visibles
    await expect(page.getByTestId('stat-total-evaluations')).toBeVisible();
    await expect(page.getByTestId('stat-classes-actives')).toBeVisible();
    await expect(page.getByTestId('stat-copies-a-corriger')).toBeVisible();
    await expect(page.getByTestId('stat-taux-de-reussite')).toBeVisible();

    // Vérifier les titres des cartes
    await expect(page.getByTestId('stat-total-evaluations')).toContainText('Total Évaluations');
    await expect(page.getByTestId('stat-classes-actives')).toContainText('Classes Actives');
    await expect(page.getByTestId('stat-copies-a-corriger')).toContainText('Copies à Corriger');
    await expect(page.getByTestId('stat-taux-de-reussite')).toContainText('Taux de Réussite');

    // Vérifier que les valeurs sont affichées (au moins les valeurs du seed)
    // Note: D'autres tests peuvent créer des évaluations, donc on vérifie que le nombre est >= attendu
    const totalEvaluationsText = await page.getByTestId('stat-total-evaluations').textContent();
    const totalMatch = totalEvaluationsText?.match(/(\d+)/);
    const totalEvaluations = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    expect(totalEvaluations).toBeGreaterThanOrEqual(2);

    await expect(page.getByTestId('stat-classes-actives')).toContainText('1');
  });

  test('should display recent evaluations table', async ({ page }) => {
    const tableBody = page.getByTestId('evaluations-table-body');

    // Vérifier que le tableau est visible
    await expect(tableBody).toBeVisible();

    // Vérifier qu'il y a au moins 2 lignes (les évaluations du seed + potentiellement d'autres)
    const rows = tableBody.locator('tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Vérifier que les en-têtes sont présents
    await expect(page.getByTestId('column-header-title')).toBeVisible();
    await expect(page.getByTestId('column-header-subject')).toBeVisible();
    await expect(page.getByTestId('column-header-date')).toBeVisible();
    await expect(page.getByTestId('column-header-status')).toBeVisible();
    await expect(page.getByTestId('column-header-actions')).toBeVisible();
  });

  test('should display evaluation status badges', async ({ page }) => {
    const tableBody = page.getByTestId('evaluations-table-body');

    // Vérifier que les badges de statut sont affichés dans le tableau
    await expect(tableBody.locator('[data-testid="status-badge-completed"]')).toBeVisible();
    await expect(tableBody.locator('[data-testid="status-badge-correcting"]')).toBeVisible();
    // 'Actif' n'est pas dans le seed data
    // await expect(tableBody.locator('[data-testid="status-badge-active"]')).toBeVisible();
  });

  test('should display notifications', async ({ page }) => {
    const notificationsList = page.getByTestId('notifications-list');

    // Vérifier que la liste de notifications est visible
    await expect(notificationsList).toBeVisible();

    // Vérifier qu'il y a des notifications (au moins 1)
    const notifications = notificationsList.locator('[data-testid^="notification-"]');
    const count = await notifications.count();
    expect(count).toBeGreaterThan(0);

    // Vérifier le titre de la section
    await expect(page.getByTestId('notifications-title')).toBeVisible();
  });

  test('should open create evaluation modal', async ({ page }) => {
    // Cliquer sur le bouton "Créer une évaluation"
    await page.getByTestId('create-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('modal-content')).toBeVisible();

    // Vérifier le titre du modal
    await expect(page.getByTestId('modal-title')).toContainText(
      'Créer une nouvelle évaluation'
    );

    // Vérifier que les champs du formulaire sont visibles
    await expect(page.getByTestId('evaluation-title-input')).toBeVisible();
    await expect(page.getByTestId('evaluation-subject-select')).toBeVisible();
  });

  test('should fill and submit evaluation creation form', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('create-evaluation-button').click();

    // Remplir le formulaire
    await page.getByTestId('evaluation-title-input').fill('Test Évaluation');
    await page.getByTestId('evaluation-subject-select').selectOption('physics');

    // Soumettre le formulaire
    await page.getByTestId('create-modal-submit').click();

    // Vérifier que le modal se ferme
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal on cancel button', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('create-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Cliquer sur Annuler
    await page.getByTestId('create-modal-cancel').click();

    // Vérifier que le modal est fermé
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal on overlay click', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('create-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Cliquer sur l'overlay (backdrop) en dehors du contenu du modal
    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });

    // Vérifier que le modal est fermé
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal on X button', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('create-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Cliquer sur le bouton X
    await page.getByTestId('modal-close-button').click();

    // Vérifier que le modal est fermé
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });
});
