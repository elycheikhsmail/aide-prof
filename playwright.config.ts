import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Dossier contenant les tests E2E
  testDir: './tests/e2e',

  // Exécution en parallèle complète
  fullyParallel: true,

  // Interdire .only en CI
  forbidOnly: !!process.env.CI,

  // Retries : 2 en CI, 0 en local
  retries: process.env.CI ? 2 : 0,

  // Workers : 1 en CI (plus stable), tous les CPU en local
  workers: process.env.CI ? 1 : undefined,

  // Format du rapport
  reporter: 'html',

  // Options partagées pour tous les tests
  use: {
    // URL de base de l'application
    baseURL: 'http://localhost:5173',

    // Trace activée au premier retry (pour debug)
    trace: 'on-first-retry',

    // Screenshot uniquement en cas d'échec
    screenshot: 'only-on-failure',

    // Video uniquement en cas d'échec
    video: 'retain-on-failure',
  },

  // Configuration des projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Tests mobile (optionnel, décommenter si nécessaire)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Serveur web de développement
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
