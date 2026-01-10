import { Page } from '@playwright/test';

/**
 * Helper pour se connecter en tant que professeur
 * Utilisé dans les beforeEach des tests nécessitant une authentification
 */
export async function loginAsProfessor(page: Page) {
  await page.goto('/login');

  // Remplir le formulaire de connexion
  await page.getByTestId('login-email').fill('ely@gmail.com');
  await page.getByTestId('login-password').fill('1234');

  // Soumettre le formulaire
  await page.getByTestId('login-submit').click();

  // Attendre la redirection vers le dashboard
  await page.waitForURL('/');

  // Vérifier que le dashboard est chargé
  await page.getByText('Tableau de bord').waitFor();
}
