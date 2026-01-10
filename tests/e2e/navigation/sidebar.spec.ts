import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should navigate to Dashboard', async ({ page }) => {
    // Cliquer sur Dashboard dans la sidebar
    await page.getByTestId('nav-dashboard').click();

    // Vérifier la navigation vers /
    await expect(page).toHaveURL('/');

    // Vérifier que le lien est actif
    const navLink = page.getByTestId('nav-dashboard');
    await expect(navLink).toHaveClass(/bg-blue-50/);
  });

  test('should navigate to Evaluations', async ({ page }) => {
    // Cliquer sur Évaluations dans la sidebar
    await page.getByTestId('nav-evaluations').click();

    // Vérifier la navigation vers /evaluations
    await expect(page).toHaveURL('/evaluations');

    // Vérifier que le lien est actif
    const navLink = page.getByTestId('nav-evaluations');
    await expect(navLink).toHaveClass(/bg-blue-50/);
  });

  test('should navigate to Classes', async ({ page }) => {
    // Cliquer sur Classes dans la sidebar
    await page.getByTestId('nav-classes').click();

    // Vérifier la navigation vers /classes
    await expect(page).toHaveURL('/classes');

    // Vérifier que le lien est actif
    const navLink = page.getByTestId('nav-classes');
    await expect(navLink).toHaveClass(/bg-blue-50/);
  });

  test('should navigate to Statistics', async ({ page }) => {
    // Cliquer sur Statistiques dans la sidebar
    await page.getByTestId('nav-statistics').click();

    // Vérifier la navigation vers /statistics
    await expect(page).toHaveURL('/statistics');

    // Vérifier que le lien est actif
    const navLink = page.getByTestId('nav-statistics');
    await expect(navLink).toHaveClass(/bg-blue-50/);
  });

  test('should navigate to Settings', async ({ page }) => {
    // Cliquer sur Paramètres dans la sidebar
    await page.getByTestId('nav-settings').click();

    // Vérifier la navigation vers /settings
    await expect(page).toHaveURL('/settings');

    // Vérifier que le lien est actif
    const navLink = page.getByTestId('nav-settings');
    await expect(navLink).toHaveClass(/bg-blue-50/);
  });

  test('should highlight only active menu item', async ({ page }) => {
    // Aller sur Évaluations
    await page.getByTestId('nav-evaluations').click();

    // Vérifier que Évaluations est actif
    await expect(page.getByTestId('nav-evaluations')).toHaveClass(/bg-blue-50/);

    // Vérifier que Dashboard n'est pas actif
    await expect(page.getByTestId('nav-dashboard')).not.toHaveClass(/bg-blue-50/);

    // Aller sur Classes
    await page.getByTestId('nav-classes').click();

    // Vérifier que Classes est actif
    await expect(page.getByTestId('nav-classes')).toHaveClass(/bg-blue-50/);

    // Vérifier que Évaluations n'est plus actif
    await expect(page.getByTestId('nav-evaluations')).not.toHaveClass(/bg-blue-50/);
  });

  test('should display all menu items', async ({ page }) => {
    // Vérifier que tous les liens de navigation sont visibles
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-evaluations')).toBeVisible();
    await expect(page.getByTestId('nav-classes')).toBeVisible();
    await expect(page.getByTestId('nav-statistics')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeVisible();

    // Vérifier les labels
    await expect(page.getByTestId('nav-dashboard')).toContainText('Dashboard');
    await expect(page.getByTestId('nav-evaluations')).toContainText('Mes évaluations');
    await expect(page.getByTestId('nav-classes')).toContainText('Mes classes');
    await expect(page.getByTestId('nav-statistics')).toContainText('Statistiques');
    await expect(page.getByTestId('nav-settings')).toContainText('Paramètres');
  });
});
