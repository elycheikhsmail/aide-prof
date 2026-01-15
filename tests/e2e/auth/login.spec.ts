import { test, expect } from '@playwright/test';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // ... (lines 8-41 skipped)


  test('should display login form', async ({ page }) => {
    // Vérifier que tous les éléments du formulaire sont visibles
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('toggle-password')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Remplir le formulaire avec les identifiants valides
    await page.getByTestId('login-email').fill('ely@gmail.com');
    await page.getByTestId('login-password').fill('1234');

    // Soumettre le formulaire
    await page.getByTestId('login-submit').click();

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/');

    // Vérifier que le dashboard est affiché
    await expect(page.getByTestId('dashboard-title')).toBeVisible();

    // Vérifier que le nom de l'utilisateur est affiché dans le header
    await expect(page.getByTestId('header-username')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Remplir le formulaire avec des identifiants invalides
    await page.getByTestId('login-email').fill('wrong@gmail.com');
    await page.getByTestId('login-password').fill('wrongpassword');

    // Soumettre le formulaire
    await page.getByTestId('login-submit').click();

    // Vérifier que l'erreur est affichée
    await expect(page.getByTestId('login-error')).toContainText(
      'Email ou mot de passe incorrect'
    );

    // Vérifier qu'on est toujours sur la page de login
    await expect(page).toHaveURL('/login');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByTestId('login-password');
    const toggleButton = page.getByTestId('toggle-password');

    // Vérifier que le type est "password" par défaut
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Cliquer sur le bouton toggle
    await toggleButton.click();

    // Vérifier que le type est maintenant "text"
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Cliquer à nouveau
    await toggleButton.click();

    // Vérifier qu'on revient à "password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to register page', async ({ page }) => {
    // Cliquer sur le lien "S'inscrire"
    await page.getByTestId('register-link').click();

    // Vérifier la navigation vers /register
    await expect(page).toHaveURL('/register');
  });

  test('should require email and password', async ({ page }) => {
    // Essayer de soumettre sans remplir les champs
    await page.getByTestId('login-submit').click();

    // Le navigateur devrait empêcher la soumission grâce à "required"
    // Vérifier qu'on est toujours sur /login
    await expect(page).toHaveURL('/login');
  });
});
