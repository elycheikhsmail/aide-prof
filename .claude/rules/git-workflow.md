# Git Workflow - Convention de Branches

## Règle de Branching

**IMPORTANT:** Chaque nouvelle fonctionnalité DOIT être développée dans une branche séparée suivant la convention de nommage ci-dessous.

### Convention de Nommage des Branches

**Format:** `feature/short-name-of-the-feature`

**Exemples:**
- `feature/student-dashboard`
- `feature/pdf-export`
- `feature/auto-correction`
- `feature/email-notifications`

### Workflow de Développement

1. **Créer une branche feature depuis main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

2. **Développer la fonctionnalité:**
   - Faire des commits réguliers et descriptifs
   - Tester localement avec `bun run build` et `bun run lint`
   - S'assurer que tout fonctionne correctement

3. **Pousser la branche feature:**
   ```bash
   git push -u origin feature/nom-de-la-fonctionnalite
   ```

4. **Créer une Pull Request (PR):**
   - Ouvrir une PR vers la branche `main`
   - Décrire clairement les changements
   - Demander une révision de code

5. **Révision et Merge:**
   - Attendre la révision et l'approbation
   - Résoudre les conflits si nécessaire
   - Merger dans `main` après approbation
   - Supprimer la branche feature après le merge

### Règles Importantes

- ❌ **NE JAMAIS** commit directement sur `main`
- ✅ **TOUJOURS** créer une branche feature pour toute nouvelle fonctionnalité
- ✅ **TOUJOURS** créer une PR avant de merger dans `main`
- ✅ **TOUJOURS** s'assurer que `bun run build` fonctionne avant de pousser
- ✅ **TOUJOURS** tester la fonctionnalité avant de créer la PR

### Autres Types de Branches

- `fix/bug-description` - Pour les corrections de bugs
- `hotfix/urgent-fix` - Pour les corrections urgentes en production
- `refactor/description` - Pour les refactorisations de code
- `docs/description` - Pour les mises à jour de documentation

### Exemple Complet

```bash
# 1. Créer la branche
git checkout main
git pull origin main
git checkout -b feature/student-results-page

# 2. Développer et tester
# ... faire les modifications ...
bun run build
bun run lint

# 3. Commiter
git add .
git commit -m "feat: Add student results page with graphs"

# 4. Pousser
git push -u origin feature/student-results-page

# 5. Créer la PR sur GitHub
gh pr create --title "Add student results page" --body "..."

# 6. Après merge, nettoyer
git checkout main
git pull origin main
git branch -d feature/student-results-page
```
