import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Authentication - Logout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should logout successfully', async ({ page }) => {
    // Vérifier qu'on est bien sur le dashboard
    await expect(page).toHaveURL('/');

    // Cliquer sur le bouton Déconnexion
    await page.getByTestId('logout-button').click();

    // Vérifier la redirection vers /login
    await expect(page).toHaveURL('/login');

    // Vérifier qu'on voit le formulaire de login
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
  });

  test('should not access protected routes after logout', async ({ page }) => {
    // Se déconnecter
    await page.getByTestId('logout-button').click();

    // Vérifier la redirection vers /login
    await expect(page).toHaveURL('/login');

    // Essayer d'accéder au dashboard directement
    await page.goto('/');

    // Devrait être redirigé vers /login
    await expect(page).toHaveURL('/login');
  });

  test('should display logout button in header', async ({ page }) => {
    // Vérifier que le bouton de déconnexion est visible
    const logoutButton = page.getByTestId('logout-button');
    await expect(logoutButton).toBeVisible();

    // Vérifier le texte
    await expect(logoutButton).toContainText('Déconnexion');
  });
});
