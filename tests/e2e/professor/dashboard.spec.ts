import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Professor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should display dashboard title and subtitle', async ({ page }) => {
    await expect(page.getByText('Tableau de bord')).toBeVisible();
    await expect(page.getByText("Vue d'ensemble de vos évaluations")).toBeVisible();
  });

  test('should display all statistics cards', async ({ page }) => {
    // Vérifier que les 4 cartes de statistiques sont visibles
    await expect(page.getByTestId('stat-total-evaluations')).toBeVisible();
    await expect(page.getByTestId('stat-classes-actives')).toBeVisible();
    await expect(page.getByTestId('stat-copies-a-corriger')).toBeVisible();
    await expect(page.getByTestId('stat-taux-de-reussite')).toBeVisible();

    // Vérifier les titres des cartes
    await expect(page.getByText('Total Évaluations')).toBeVisible();
    await expect(page.getByText('Classes Actives')).toBeVisible();
    await expect(page.getByText('Copies à Corriger')).toBeVisible();
    await expect(page.getByText('Taux de Réussite')).toBeVisible();

    // Vérifier que les valeurs sont affichées (selon mockData)
    await expect(page.getByTestId('stat-total-evaluations')).toContainText('12');
    await expect(page.getByTestId('stat-classes-actives')).toContainText('3');
    await expect(page.getByTestId('stat-copies-a-corriger')).toContainText('45');
    await expect(page.getByTestId('stat-taux-de-reussite')).toContainText('72.5%');
  });

  test('should display recent evaluations table', async ({ page }) => {
    const tableBody = page.getByTestId('evaluations-table-body');

    // Vérifier que le tableau est visible
    await expect(tableBody).toBeVisible();

    // Vérifier qu'il y a exactement 5 lignes (slice(0, 5))
    const rows = tableBody.locator('tr');
    await expect(rows).toHaveCount(5);

    // Vérifier que les en-têtes sont présents
    await expect(page.getByRole('columnheader', { name: 'Titre' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Matière' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Statut' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  test('should display evaluation status badges', async ({ page }) => {
    const tableBody = page.getByTestId('evaluations-table-body');

    // Vérifier que les badges de statut sont affichés dans le tableau
    await expect(tableBody.getByText('Terminé')).toBeVisible();
    await expect(tableBody.getByText('Actif')).toBeVisible();
    await expect(tableBody.getByText('Correction')).toBeVisible();
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
    await expect(page.getByText('Notifications')).toBeVisible();
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
    await page.getByTestId('modal-footer').getByRole('button', { name: 'Créer' }).click();

    // Vérifier que le modal se ferme
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should close modal on cancel button', async ({ page }) => {
    // Ouvrir le modal
    await page.getByTestId('create-evaluation-button').click();

    // Vérifier que le modal est ouvert
    await expect(page.getByTestId('modal-overlay')).toBeVisible();

    // Cliquer sur Annuler
    await page.getByTestId('modal-footer').getByRole('button', { name: 'Annuler' }).click();

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
