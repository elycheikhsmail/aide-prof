# Plan: Renommer le dossier /src en /frontend

## Vue d'Ensemble

Ce plan détaille les étapes nécessaires pour renommer le dossier `/src` en `/frontend` et mettre à jour toutes les références dans le projet.

## Fichiers à Modifier

### 1. Fichiers de Configuration

#### `tsconfig.app.json`
- **Ligne 27**: Changer `"include": ["src"]` en `"include": ["frontend"]`

#### `index.html`
- **Ligne 11**: Changer `<script type="module" src="/src/main.tsx"></script>` en `<script type="module" src="/frontend/main.tsx"></script>`

#### `vite.config.ts`
- Ajouter explicitement la configuration du root pour pointer vers `frontend`:
  ```typescript
  export default defineConfig({
    root: 'frontend',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  });
  ```

#### `verify-setup.sh`
- **Ligne 8**: Changer `src/components/ui` en `frontend/components/ui`
- **Ligne 18**: Changer `src/components/ui/$comp` en `frontend/components/ui/$comp`
- **Ligne 38**: Changer `src/data/mockData.ts` en `frontend/data/mockData.ts`

### 2. Fichiers de Documentation

#### `CLAUDE.md`
- Remplacer toutes les occurrences de `/src` par `/frontend`
- Mettre à jour la section "Structure des Dossiers" (lignes 152-172)
- Mettre à jour les exemples de code et les chemins de fichiers

#### `README.md`
- **Lignes 28-40**: Mettre à jour la structure du projet
- Remplacer toutes les références à `src/` par `frontend/`

#### `CLAUDE_FILES/E2E_IMPLEMENTATION_SUMMARY.md`
- Remplacer toutes les références à `src/` par `frontend/`
- Mettre à jour les chemins de fichiers dans les tableaux

#### `CLAUDE_FILES/E2E_TEST_PLAN.md`
- Remplacer toutes les références à `src/` par `frontend/`
- Mettre à jour les exemples de code

#### `CLAUDE_FILES/E2E_TESTS_README.md`
- Remplacer toutes les références à `src/` par `frontend/`

#### `plans/backend-frontend-integration.md`
- Remplacer toutes les références à `src/` par `frontend/`
- Mettre à jour les chemins de fichiers

#### `plans/INTEGRATION_QUICK_START.md`
- Remplacer toutes les références à `src/` par `frontend/`

### 3. Fichiers de Code (Imports)

Tous les fichiers dans le dossier `/src` (qui deviendra `/frontend`) doivent être vérifiés pour les imports relatifs:

#### Fichiers à vérifier:
- `frontend/main.tsx`
- `frontend/App.tsx`
- `frontend/index.css`
- `frontend/contexts/*.tsx`
- `frontend/components/**/*.tsx`
- `frontend/pages/**/*.tsx`
- `frontend/services/*.ts`
- `frontend/utils/*.ts`
- `frontend/config/*.ts`
- `frontend/types/*.ts`
- `frontend/data/*.ts`

#### Types d'imports à vérifier:
- Imports relatifs: `import ... from '../...'`
- Imports absolus: `import ... from '/src/...'` (si utilisés)
- Imports de modules: `import ... from './...'` (ceux-ci ne changeront pas)

## Ordre d'Exécution

### Étape 1: Préparation
1. Créer une branche git pour ce changement
2. S'assurer que le build fonctionne actuellement
3. Faire un commit de sauvegarde

### Étape 2: Renommer le dossier
1. Renommer le dossier `/src` en `/frontend`
2. Vérifier que tous les fichiers ont été déplacés correctement

### Étape 3: Mettre à jour les fichiers de configuration
1. Mettre à jour `tsconfig.app.json`
2. Mettre à jour `index.html`
3. Mettre à jour `vite.config.ts`
4. Mettre à jour `verify-setup.sh`

### Étape 4: Mettre à jour les imports dans le code
1. Parcourir tous les fichiers dans `/frontend`
2. Mettre à jour les imports relatifs si nécessaire
3. Vérifier qu'il n'y a pas d'imports absolus vers `/src`

### Étape 5: Mettre à jour la documentation
1. Mettre à jour `CLAUDE.md`
2. Mettre à jour `README.md`
3. Mettre à jour les fichiers dans `CLAUDE_FILES/`
4. Mettre à jour les fichiers dans `plans/`

### Étape 6: Vérification
1. Exécuter `bun run build` pour vérifier que le build fonctionne
2. Exécuter `bun run lint` pour vérifier le linting
3. Démarrer le serveur de développement: `bun run dev`
4. Vérifier que l'application fonctionne correctement dans le navigateur
5. Exécuter les tests E2E: `bun test:e2e`

### Étape 7: Commit et Push
1. Committer tous les changements
2. Pousser la branche
3. Créer une Pull Request

## Risques et Mitigation

### Risque 1: Imports cassés
**Mitigation**: Vérifier systématiquement tous les imports après le renommage

### Risque 2: Build échoue
**Mitigation**: Tester le build immédiatement après chaque étape majeure

### Risque 3: Tests E2E échouent
**Mitigation**: Mettre à jour les sélecteurs et les chemins dans les tests

### Risque 4: Documentation incohérente
**Mitigation**: Revoir toute la documentation après les changements

## Checklist de Validation

- [ ] Branche git créée
- [ ] Build fonctionne avant les changements
- [ ] Dossier `/src` renommé en `/frontend`
- [ ] `tsconfig.app.json` mis à jour
- [ ] `index.html` mis à jour
- [ ] `vite.config.ts` mis à jour
- [ ] `verify-setup.sh` mis à jour
- [ ] Tous les imports dans le code mis à jour
- [ ] `CLAUDE.md` mis à jour
- [ ] `README.md` mis à jour
- [ ] Documentation dans `CLAUDE_FILES/` mise à jour
- [ ] Documentation dans `plans/` mise à jour
- [ ] `bun run build` fonctionne
- [ ] `bun run lint` fonctionne
- [ ] `bun run dev` fonctionne
- [ ] Application fonctionne dans le navigateur
- [ ] Tests E2E passent
- [ ] Changements commités
- [ ] Branche poussée
- [ ] Pull Request créée

## Temps Estimé

- Préparation: 5 minutes
- Renommage du dossier: 1 minute
- Mise à jour des fichiers de configuration: 10 minutes
- Mise à jour des imports: 15-20 minutes
- Mise à jour de la documentation: 20-30 minutes
- Vérification: 10-15 minutes
- Commit et Push: 5 minutes

**Total estimé**: 1-1.5 heures

## Notes Importantes

1. **Vérifier les imports relatifs**: La plupart des imports relatifs ne changeront pas car ils sont relatifs au fichier courant. Seuls les imports absolus ou les imports qui référencent explicitement `/src` devront être modifiés.

2. **Vite root**: Il est important de configurer explicitement le `root` dans `vite.config.ts` pour éviter toute confusion.

3. **Tests E2E**: Les tests Playwright utilisent des `data-testid` qui ne seront pas affectés par le renommage, mais il faut vérifier qu'il n'y a pas de références aux chemins de fichiers dans les tests.

4. **Documentation**: Il est crucial de mettre à jour toute la documentation pour éviter la confusion future.

5. **Git**: Utiliser `git mv` pour renommer le dossier afin de préserver l'historique des fichiers.
