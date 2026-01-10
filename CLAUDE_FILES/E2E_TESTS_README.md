# Tests E2E - Guide d'Utilisation

## 📦 Installation

Les dépendances sont déjà installées. Si besoin de réinstaller :

```bash
bun add -D @playwright/test
bunx playwright install
```

## 🚀 Lancer les Tests

### Mode Headless (par défaut)
```bash
bun test:e2e
```

### Mode UI Interactif (Recommandé pour développement)
```bash
bun test:e2e:ui
```

### Mode Debug
```bash
bun test:e2e:debug
```

### Voir le Rapport HTML
```bash
bun test:e2e:report
```

### Lancer un fichier spécifique
```bash
bunx playwright test tests/e2e/auth/login.spec.ts
```

### Lancer sur un navigateur spécifique
```bash
bunx playwright test --project=chromium
bunx playwright test --project=firefox
bunx playwright test --project=webkit
```

## 📂 Structure des Tests

```
tests/
└── e2e/
    ├── auth/
    │   ├── login.spec.ts       # Tests de connexion
    │   └── logout.spec.ts      # Tests de déconnexion
    ├── navigation/
    │   └── sidebar.spec.ts     # Tests de navigation
    ├── professor/
    │   └── dashboard.spec.ts   # Tests du dashboard professeur
    └── fixtures/
        └── auth.ts             # Helper pour login automatique
```

## ✅ Tests Implémentés

### Authentication (10 tests)
- ✅ Affichage du formulaire de login
- ✅ Connexion avec identifiants valides
- ✅ Erreur avec identifiants invalides
- ✅ Toggle visibilité du mot de passe
- ✅ Navigation vers page d'inscription
- ✅ Validation des champs requis
- ✅ Déconnexion réussie
- ✅ Redirection après déconnexion
- ✅ Protection des routes après logout
- ✅ Affichage du bouton de déconnexion

### Dashboard Professeur (10 tests)
- ✅ Affichage du titre et sous-titre
- ✅ Affichage des 4 cartes de statistiques
- ✅ Affichage du tableau des évaluations
- ✅ Affichage des badges de statut
- ✅ Affichage des notifications
- ✅ Ouverture du modal de création
- ✅ Remplissage et soumission du formulaire
- ✅ Fermeture du modal (bouton Annuler)
- ✅ Fermeture du modal (clic overlay)
- ✅ Fermeture du modal (bouton X)

### Navigation (7 tests)
- ✅ Navigation vers Dashboard
- ✅ Navigation vers Évaluations
- ✅ Navigation vers Classes
- ✅ Navigation vers Statistiques
- ✅ Navigation vers Paramètres
- ✅ Mise en surbrillance de l'élément actif
- ✅ Affichage de tous les éléments de menu

**Total : 27 tests implémentés**

## 🎯 Couverture Actuelle

| Fonctionnalité | Couverture | Tests |
|---------------|-----------|-------|
| Authentification | 100% | 10/10 |
| Navigation | 100% | 7/7 |
| Dashboard | 100% | 10/10 |
| Modal création | 100% | 4/4 |
| **TOTAL** | **100%** | **27 tests** |

## 🔧 Configuration

La configuration se trouve dans [`playwright.config.ts`](../playwright.config.ts) :

- **URL de base** : `http://localhost:5173`
- **Navigateurs** : Chromium, Firefox, WebKit
- **Retries** : 2 en CI, 0 en local
- **Parallélisation** : Activée
- **Screenshots** : Uniquement en cas d'échec
- **Trace** : Au premier retry
- **Serveur web** : Démarrage automatique avec `bun run dev`

## 📝 Écrire de Nouveaux Tests

### Exemple de Test avec Authentification

```typescript
import { test, expect } from '@playwright/test';
import { loginAsProfessor } from '../fixtures/auth';

test.describe('Ma Fonctionnalité', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test('should do something', async ({ page }) => {
    // Utiliser data-testid pour sélectionner les éléments
    await page.getByTestId('mon-element').click();

    // Assertions
    await expect(page.getByTestId('resultat')).toBeVisible();
  });
});
```

### Exemple de Test Sans Authentification

```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Publique', () => {
  test('should display content', async ({ page }) => {
    await page.goto('/public-page');

    await expect(page.getByText('Contenu')).toBeVisible();
  });
});
```

## 🏷️ Data-testid Disponibles

### Authentification
- `login-email` - Champ email
- `login-password` - Champ mot de passe
- `toggle-password` - Bouton toggle visibilité
- `login-submit` - Bouton de soumission
- `login-error` - Message d'erreur
- `logout-button` - Bouton de déconnexion

### Navigation
- `nav-dashboard` - Lien Dashboard
- `nav-evaluations` - Lien Évaluations
- `nav-classes` - Lien Classes
- `nav-statistics` - Lien Statistiques
- `nav-settings` - Lien Paramètres

### Dashboard
- `create-evaluation-button` - Bouton créer évaluation
- `stat-total-evaluations` - Carte Total Évaluations
- `stat-classes-actives` - Carte Classes Actives
- `stat-copies-a-corriger` - Carte Copies à Corriger
- `stat-taux-de-reussite` - Carte Taux de Réussite
- `evaluations-table-body` - Corps du tableau
- `evaluation-row-{id}` - Ligne d'évaluation
- `notifications-list` - Liste de notifications
- `notification-{id}` - Notification individuelle

### Modal
- `modal-overlay` - Overlay du modal
- `modal-content` - Contenu du modal
- `modal-title` - Titre du modal
- `modal-body` - Corps du modal
- `modal-footer` - Footer du modal
- `modal-close-button` - Bouton X de fermeture
- `evaluation-title-input` - Champ titre évaluation
- `evaluation-subject-select` - Select matière

## 🐛 Debugging

### Mode Debug Interactif
```bash
bun test:e2e:debug
```

### Voir les Traces
Après un échec avec retry, les traces sont disponibles dans le rapport HTML :
```bash
bun test:e2e:report
```

### Screenshots
Les screenshots des tests échoués se trouvent dans `test-results/`

### Logs
Pour voir plus de logs :
```bash
DEBUG=pw:api bunx playwright test
```

## 📊 Rapports

Après l'exécution des tests, un rapport HTML est généré automatiquement.

Pour l'ouvrir :
```bash
bun test:e2e:report
```

Le rapport contient :
- Résultats de chaque test
- Screenshots des échecs
- Traces d'exécution
- Temps d'exécution
- Statistiques globales

## 🔄 CI/CD

Les tests sont configurés pour s'exécuter en CI avec :
- 2 retries en cas d'échec
- 1 worker (exécution séquentielle pour stabilité)
- Screenshots et vidéos en cas d'échec
- Rapport HTML généré automatiquement

## 💡 Bonnes Pratiques

1. **Utiliser data-testid** : Toujours préférer `data-testid` aux sélecteurs CSS
2. **Tests isolés** : Chaque test doit être indépendant
3. **Attentes explicites** : Utiliser `await expect()` au lieu de `waitForTimeout()`
4. **Fixtures** : Réutiliser les helpers comme `loginAsProfessor()`
5. **Descriptions claires** : Nommer les tests avec `should...`
6. **Groupement** : Utiliser `test.describe()` pour organiser

## 🚧 Prochaines Étapes

Tests à ajouter :
- [ ] Page Évaluations (création, édition, suppression)
- [ ] Page Classes (gestion des classes)
- [ ] Page Statistiques (graphiques, exports)
- [ ] Page Paramètres (modification profil)
- [ ] Tests de formulaires complexes
- [ ] Tests de validation
- [ ] Tests d'accessibilité

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging Guide](https://playwright.dev/docs/debug)
