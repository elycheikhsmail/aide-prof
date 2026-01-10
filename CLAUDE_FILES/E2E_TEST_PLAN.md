# Plan de Tests E2E pour Aide-Prof

## 📋 Résumé Exécutif

Ce document présente le plan complet pour implémenter les tests End-to-End (E2E) pour l'application Aide-Prof. Les tests E2E couvriront tous les parcours utilisateurs critiques et garantiront la qualité de l'application.

**Framework recommandé :** **Playwright** (moderne, rapide, multi-navigateurs, excellent support TypeScript)

---

## 🎯 Fonctionnalités à Tester

### 1. **Authentification** ✅
- Login avec identifiants valides
- Login avec identifiants invalides (gestion d'erreurs)
- Toggle affichage/masquage du mot de passe
- Redirection après login réussi
- Accès à la page Register
- Protection des routes (redirection si non authentifié)
- Logout et redirection vers login

### 2. **Navigation** ✅
- Navigation via Sidebar (5 pages)
- État actif du menu selon la page
- Navigation via Header (logo cliquable)
- Accessibilité des routes protégées

### 3. **Dashboard Professeur** ✅
- Affichage des 4 cartes de statistiques avec valeurs correctes
- Affichage des tendances (icônes up/down)
- Tableau des évaluations récentes (5 premières)
- Badges de statut colorés (Draft, Actif, Correction, Terminé)
- Affichage des notifications avec types
- Bouton "Créer une évaluation" fonctionnel

### 4. **Modal de Création d'Évaluation** ✅
- Ouverture du modal au clic du bouton
- Formulaire avec titre et matière
- Validation du formulaire
- Fermeture avec bouton Annuler
- Fermeture avec bouton backdrop
- Soumission du formulaire (console.log actuellement)

### 5. **Pages Professeur** (Placeholders actuellement)
- Évaluations - navigation et affichage
- Classes - navigation et affichage
- Statistiques - navigation et affichage
- Paramètres - navigation et affichage

---

## 🏗️ Architecture des Tests E2E

### Structure Recommandée

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── navigation/
│   │   └── sidebar.spec.ts
│   ├── professor/
│   │   ├── dashboard.spec.ts
│   │   ├── create-evaluation.spec.ts
│   │   ├── evaluations.spec.ts
│   │   ├── classes.spec.ts
│   │   ├── statistics.spec.ts
│   │   └── settings.spec.ts
│   └── fixtures/
│       ├── auth.ts           # Helper pour login automatique
│       └── test-data.ts      # Données de test
├── playwright.config.ts
└── helpers/
    ├── selectors.ts          # Sélecteurs centralisés
    └── assertions.ts         # Assertions personnalisées
```

---

## 📝 Étapes d'Implémentation

### **Phase 1 : Configuration de Playwright** ⚙️

#### Étape 1.1 : Installation
```bash
bun add -D @playwright/test
bunx playwright install
```

#### Étape 1.2 : Configuration (`playwright.config.ts`)
- Base URL: http://localhost:5173
- Browsers: Chromium, Firefox, WebKit
- Timeout: 30s par test
- Retries: 2 (en CI), 0 (en local)
- Screenshots: on failure
- Trace: on first retry

#### Étape 1.3 : Scripts package.json
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug",
"test:e2e:report": "playwright show-report"
```

---

### **Phase 2 : Préparation du Code Existant** 🔧

#### Modifications Nécessaires

**Oui, il faut préparer le code existant** pour faciliter les tests E2E :

#### 2.1. **Ajouter des `data-testid`** (CRITIQUE)

Les `data-testid` permettent de sélectionner les éléments de manière stable et indépendante du style.

**Fichiers à modifier :**

##### `src/pages/auth/Login.tsx`
```tsx
// Ajouter data-testid aux éléments principaux
<Input
  data-testid="login-email"
  label="Email"
  ...
/>
<Input
  data-testid="login-password"
  label="Mot de passe"
  ...
/>
<button
  data-testid="toggle-password"
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  ...
>
<Button data-testid="login-submit" type="submit">
  Se connecter
</Button>
<div data-testid="login-error" className="bg-red-50...">
  {error}
</div>
```

##### `src/components/layout/Header.tsx`
```tsx
<button data-testid="logout-button" onClick={onLogout}>
  Déconnexion
</button>
```

##### `src/components/layout/Sidebar.tsx`
```tsx
<NavLink
  data-testid={`nav-${item.id}`}
  to={item.path}
  ...
>
```

##### `src/pages/professor/Dashboard.tsx`
```tsx
<Button
  data-testid="create-evaluation-button"
  variant="primary"
  onClick={() => setIsModalOpen(true)}
>

<StatCard
  data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
  title="Total Évaluations"
  ...
/>

<tbody data-testid="evaluations-table-body">
  {mockEvaluations.slice(0, 5).map((evaluation) => (
    <tr data-testid={`evaluation-row-${evaluation.id}`}>
      ...
    </tr>
  ))}
</tbody>

<div data-testid="notifications-list">
  {mockNotifications.map((notification) => (
    <div
      data-testid={`notification-${notification.id}`}
      key={notification.id}
      ...
    >
  ))}
</div>
```

##### `src/components/ui/Modal.tsx`
```tsx
<div data-testid="modal-overlay" onClick={onClose}>
  <div data-testid="modal-content" onClick={handleContentClick}>
    <h2 data-testid="modal-title">{title}</h2>
    <div data-testid="modal-body">{children}</div>
    {footer && <div data-testid="modal-footer">{footer}</div>}
  </div>
</div>
```

#### 2.2. **Améliorer la Composante `Input`**

Pour supporter `data-testid` :

```tsx
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  'data-testid'?: string; // Ajouter cette prop
}

export function Input({ label, error, 'data-testid': testId, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input data-testid={testId} {...props} />
      {error && <span>{error}</span>}
    </div>
  );
}
```

Même chose pour `Button`, `Select`, etc.

#### 2.3. **Configuration Environment Variables pour Tests**

Créer `.env.test` :
```env
VITE_API_URL=http://localhost:5173
VITE_TEST_MODE=true
```

---

### **Phase 3 : Écriture des Tests** ✍️

#### Exemple de Test Complet - Login

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByTestId('login-email').fill('ely@gmail.com');
    await page.getByTestId('login-password').fill('1234');
    await page.getByTestId('login-submit').click();

    // Redirection vers dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Tableau de bord')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.getByTestId('login-email').fill('wrong@gmail.com');
    await page.getByTestId('login-password').fill('wrong');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText(
      'Email ou mot de passe incorrect'
    );
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByTestId('login-password');
    const toggleButton = page.getByTestId('toggle-password');

    // Par défaut, type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Clic sur toggle
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Re-clic
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
```

#### Exemple de Test - Dashboard

```typescript
// tests/e2e/professor/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Professor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should display statistics cards', async ({ page }) => {
    // Vérifier les 4 cartes
    await expect(page.getByText('Total Évaluations')).toBeVisible();
    await expect(page.getByText('Classes Actives')).toBeVisible();
    await expect(page.getByText('Copies à Corriger')).toBeVisible();
    await expect(page.getByText('Taux de Réussite')).toBeVisible();

    // Vérifier les valeurs (depuis mockData)
    await expect(page.getByText('12')).toBeVisible(); // totalEvaluations
    await expect(page.getByText('3')).toBeVisible();  // activeClasses
  });

  test('should display recent evaluations table', async ({ page }) => {
    const tableBody = page.getByTestId('evaluations-table-body');

    // Vérifier 5 lignes
    const rows = tableBody.locator('tr');
    await expect(rows).toHaveCount(5);

    // Vérifier première évaluation
    await expect(rows.first()).toContainText('Contrôle Mathématiques');
    await expect(rows.first()).toContainText('Terminé');
  });

  test('should open create evaluation modal', async ({ page }) => {
    await page.getByTestId('create-evaluation-button').click();

    // Modal visible
    await expect(page.getByTestId('modal-overlay')).toBeVisible();
    await expect(page.getByTestId('modal-title')).toContainText(
      'Créer une nouvelle évaluation'
    );

    // Formulaire visible
    await expect(page.getByLabel("Titre de l'évaluation")).toBeVisible();
    await expect(page.getByLabel('Matière')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.getByTestId('create-evaluation-button').click();
    await page.getByText('Annuler').click();

    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('should display notifications', async ({ page }) => {
    const notificationsList = page.getByTestId('notifications-list');

    // Au moins 3 notifications (selon mockData)
    const notifications = notificationsList.locator('[data-testid^="notification-"]');
    await expect(notifications).toHaveCount(3);
  });
});
```

#### Fixture d'Authentification

```typescript
// tests/e2e/fixtures/auth.ts
import { Page } from '@playwright/test';

export async function loginAsProfessor(page: Page) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('ely@gmail.com');
  await page.getByTestId('login-password').fill('1234');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/');
}
```

---

### **Phase 4 : Tests de Navigation**

```typescript
// tests/e2e/navigation/sidebar.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  const menuItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard' },
    { id: 'evaluations', path: '/evaluations', label: 'Mes évaluations' },
    { id: 'classes', path: '/classes', label: 'Mes classes' },
    { id: 'statistics', path: '/statistics', label: 'Statistiques' },
    { id: 'settings', path: '/settings', label: 'Paramètres' },
  ];

  menuItems.forEach(({ id, path, label }) => {
    test(`should navigate to ${label}`, async ({ page }) => {
      await page.getByTestId(`nav-${id}`).click();
      await expect(page).toHaveURL(path);

      // Vérifier état actif
      const navLink = page.getByTestId(`nav-${id}`);
      await expect(navLink).toHaveClass(/bg-blue-50/);
    });
  });

  test('should highlight active menu item', async ({ page }) => {
    // Aller sur Évaluations
    await page.getByTestId('nav-evaluations').click();

    // Évaluations actif, Dashboard pas actif
    await expect(page.getByTestId('nav-evaluations')).toHaveClass(/bg-blue-50/);
    await expect(page.getByTestId('nav-dashboard')).not.toHaveClass(/bg-blue-50/);
  });
});
```

---

### **Phase 5 : Tests Visuels (Optionnel mais Recommandé)**

```typescript
test('should match dashboard screenshot', async ({ page }) => {
  await loginAsProfessor(page);
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

---

## 🚀 Commandes de Test

```bash
# Lancer tous les tests E2E
bun test:e2e

# Mode UI interactif (recommandé pour développement)
bun test:e2e:ui

# Mode debug
bun test:e2e:debug

# Lancer un fichier spécifique
bunx playwright test tests/e2e/auth/login.spec.ts

# Lancer avec un navigateur spécifique
bunx playwright test --project=chromium

# Générer un rapport HTML
bun test:e2e:report
```

---

## 📊 Couverture des Tests

### Critères de Succès

- ✅ **Authentification** : 100% (tous les scénarios)
- ✅ **Navigation** : 100% (toutes les routes)
- ✅ **Dashboard** : 100% (stats, tableau, notifications, modal)
- ✅ **Composants UI** : 80%+ (Button, Input, Modal, Card, Badge)
- ✅ **Gestion d'erreurs** : 100% (login échoué, validation)

### Métriques

- **Nombre total de tests** : ~30-40 tests
- **Temps d'exécution** : < 2 minutes (tous les tests)
- **Taux de réussite cible** : 100%

---

## 🎯 Checklist d'Implémentation

### Préparation du Code (Phase 2)
- [ ] Ajouter `data-testid` à Login.tsx
- [ ] Ajouter `data-testid` à Dashboard.tsx
- [ ] Ajouter `data-testid` à Sidebar.tsx
- [ ] Ajouter `data-testid` à Header.tsx
- [ ] Ajouter `data-testid` à Modal.tsx
- [ ] Modifier Input.tsx pour supporter data-testid
- [ ] Modifier Button.tsx pour supporter data-testid
- [ ] Modifier Select.tsx pour supporter data-testid
- [ ] Modifier Badge.tsx pour supporter data-testid
- [ ] Modifier StatCard.tsx pour supporter data-testid

### Configuration (Phase 1)
- [ ] Installer Playwright
- [ ] Créer playwright.config.ts
- [ ] Ajouter scripts au package.json
- [ ] Créer structure de dossiers tests/

### Tests (Phase 3-4)
- [ ] Écrire tests d'authentification (login, logout)
- [ ] Écrire fixture auth.ts
- [ ] Écrire tests de navigation (sidebar)
- [ ] Écrire tests du dashboard (stats, tableau, notifications)
- [ ] Écrire tests du modal de création
- [ ] Écrire tests des pages placeholder

### CI/CD (Phase 6 - Optionnel)
- [ ] Configurer GitHub Actions / GitLab CI
- [ ] Ajouter job de tests E2E dans pipeline
- [ ] Configurer upload des artifacts (screenshots, videos)

---

## 💡 Bonnes Pratiques

1. **Isolation des Tests** : Chaque test doit être indépendant
2. **Données de Test** : Utiliser des fixtures/mocks pour données prévisibles
3. **Attente Explicite** : Utiliser `await expect()` plutôt que `waitForTimeout()`
4. **Sélecteurs Stables** : Privilégier `data-testid` > role > text > CSS
5. **Tests Lisibles** : Nommer clairement les tests (should...)
6. **Parallélisation** : Playwright exécute les tests en parallèle par défaut
7. **Retry Strategy** : Configurer retries pour gérer les flakiness

---

## 🔍 Exemple de Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## ⏱️ Timeline Estimée

1. **Phase 1 - Configuration** : 1-2 heures
2. **Phase 2 - Préparation du code** : 3-4 heures
3. **Phase 3 - Tests Auth & Navigation** : 2-3 heures
4. **Phase 4 - Tests Dashboard** : 3-4 heures
5. **Phase 5 - Tests Composants** : 2-3 heures
6. **Phase 6 - CI/CD** : 1-2 heures

**Total** : ~15-20 heures de travail

---

## 🎓 Conclusion

Ce plan couvre l'intégralité de l'implémentation des tests E2E pour Aide-Prof. La préparation du code existant est **nécessaire** pour garantir des tests stables et maintenables. Les `data-testid` sont le pilier de cette stratégie.

**Prochaine étape** : Décider si vous souhaitez que je commence l'implémentation, et par quelle phase commencer (je recommande Phase 1 + Phase 2.1 en parallèle).
