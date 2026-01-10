# Fonctionnalité d'Import JSON d'Évaluations

## Résumé

Implémentation complète d'une fonctionnalité permettant aux professeurs d'importer des évaluations depuis des fichiers JSON, avec validation, aperçu et helpers de test Playwright.

## Date d'implémentation

31 décembre 2025

## Fichiers Créés

### Phase 1 : Validation et Utilitaires

1. **`src/utils/evaluationValidator.ts`**
   - Fonction `validateEvaluationJSON()` : Validation complète du JSON
   - Fonction `normalizeEvaluationData()` : Normalisation avec valeurs par défaut
   - Validation des champs requis, types, cohérence des points
   - Gestion des erreurs bloquantes et warnings non-bloquants

2. **`tests/data/evaluation-examples.json`**
   - Exemples de JSON valides (complet et minimal)
   - Exemples de JSON invalides pour tester la validation
   - Cas d'erreur : titre manquant, points incorrects, date invalide, etc.

### Phase 2 : Composants UI de Base

3. **`src/components/ui/FileUpload.tsx`**
   - Composant réutilisable d'upload de fichier
   - Support drag & drop
   - Bouton de sélection de fichier
   - Lecture du contenu avec FileReader
   - Validation de l'extension de fichier
   - Affichage du fichier sélectionné avec bouton de suppression

### Phase 3 : Composants Spécifiques

4. **`src/components/professor/EvaluationPreview.tsx`**
   - Aperçu de validation de l'évaluation
   - Affichage des erreurs et warnings
   - Prévisualisation des informations de base
   - Liste des questions avec détails
   - Calcul et vérification du total des points
   - Badges de statut colorés

5. **`src/components/professor/ImportEvaluationModal.tsx`**
   - Modal en 3 étapes pour l'import JSON
   - **Étape 1** : Choix de la méthode (upload fichier OU coller JSON)
   - **Étape 2** : Validation et aperçu avec erreurs/warnings
   - **Étape 3** : Message de succès
   - Navigation entre étapes avec boutons Retour/Suivant/Confirmer
   - Gestion d'état complète (step, method, jsonInput, validationResult)

### Phase 4 : Intégration Dashboard

6. **Modifications dans `src/pages/professor/Dashboard.tsx`**
   - Ajout du bouton "Importer JSON" avec icône Upload
   - État pour le modal d'import (`isImportModalOpen`)
   - Handler `handleImportEvaluation()` pour traiter l'import
   - Rendu du composant `ImportEvaluationModal`
   - Placement côte à côte avec le bouton "Créer une évaluation"

### Phase 5 : Tests Playwright

7. **`tests/e2e/fixtures/data.ts`**
   - Helper `importEvaluationFromJSON()` : Import via textarea
   - Helper `importEvaluationFromFile()` : Import via upload de fichier
   - Helper `createMinimalEvaluation()` : Données minimales pour tests
   - Helper `createCompleteEvaluation()` : Données complètes pour tests
   - Helper `createInvalidEvaluation()` : Données invalides pour tests
   - Helper `createInconsistentEvaluation()` : Points incohérents pour tests

8. **`tests/e2e/professor/evaluation-import.spec.ts`**
   - 14 tests e2e complets couvrant tous les scénarios
   - Tests d'ouverture du modal et sélection de méthode
   - Tests d'import réussi (textarea et fichier)
   - Tests de validation d'erreurs (JSON invalide, champs manquants, incohérences)
   - Tests d'affichage des warnings
   - Tests de navigation (retour, annulation, changement de méthode)
   - Tests d'aperçu de l'évaluation valide

### Fichiers Modifiés

9. **`src/components/ui/index.ts`**
   - Ajout de l'export `FileUpload`

## Architecture de la Fonctionnalité

### Flux Utilisateur

```
Dashboard
  ↓ Clic "Importer JSON"
ImportEvaluationModal (Étape 1)
  ↓ Choix méthode
  ├─ Upload fichier → FileUpload
  └─ Coller JSON → Textarea
  ↓ Clic "Suivant"
ImportEvaluationModal (Étape 2)
  ↓ Validation avec evaluationValidator
EvaluationPreview
  ├─ Erreurs (bloquantes) → Bouton Confirmer désactivé
  └─ Warnings (non bloquantes) → Bouton Confirmer activé
  ↓ Clic "Confirmer"
ImportEvaluationModal (Étape 3)
  ↓ Message de succès
Dashboard (modal fermé)
  ↓ Callback onImport()
Console.log de l'évaluation importée
```

### Validation JSON

**Champs requis :**
- `title` (string non vide)
- `subject` (string non vide)
- `date` (string format ISO YYYY-MM-DD)
- `duration` (number > 0)
- `totalPoints` (number > 0)
- `questions` (array non vide)

**Validation des questions :**
- Chaque question doit avoir : `id`, `number`, `statement`, `modelAnswer`, `points`, `estimatedLines`
- `totalPoints` doit correspondre à la somme des `points` des questions

**Champs optionnels (avec warnings) :**
- `id` (généré automatiquement si absent)
- `professorId` (assigné automatiquement si absent)
- `status` (défaut: "draft")
- `classIds` (défaut: [])

### Data-testid Ajoutés

**Dashboard :**
- `import-evaluation-button`

**ImportEvaluationModal :**
- `import-method-file`
- `import-method-paste`
- `json-textarea`
- `change-import-method`
- `import-modal-next`
- `import-modal-back`
- `import-modal-confirm`
- `import-modal-cancel`

**FileUpload :**
- `file-upload-dropzone`
- `file-upload-input`
- `file-upload-button`
- `file-upload-selected`
- `file-upload-clear`
- `file-upload-error`

**EvaluationPreview :**
- `evaluation-preview`
- `validation-errors`
- `validation-error-{index}`
- `validation-warnings`
- `validation-warning-{index}`
- `preview-basic-info`
- `preview-questions`
- `preview-question-{index}`
- `preview-classes`

## Utilisation

### Interface Utilisateur

1. Sur le dashboard professeur, cliquer sur "Importer JSON"
2. Choisir entre "Upload fichier .json" ou "Coller JSON"
3. Fournir le JSON (upload ou paste)
4. Cliquer sur "Suivant" pour valider
5. Vérifier l'aperçu et les erreurs/warnings
6. Si valide, cliquer sur "Confirmer" pour créer l'évaluation
7. L'évaluation est importée et le modal se ferme

### Tests Playwright

```typescript
import { importEvaluationFromJSON, createCompleteEvaluation } from '../fixtures/data';

test('should import evaluation', async ({ page }) => {
  await loginAsProfessor(page);
  const testEval = createCompleteEvaluation();
  await importEvaluationFromJSON(page, testEval);
  // L'évaluation est maintenant importée
});
```

## Format JSON Attendu

```json
{
  "title": "Contrôle Algèbre Linéaire",
  "subject": "Mathématiques",
  "date": "2025-01-15",
  "duration": 120,
  "totalPoints": 20,
  "classIds": ["class-1"],
  "status": "draft",
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "statement": "Résoudre le système d'équations...",
      "modelAnswer": "Étapes: 1) Mise en forme...",
      "points": 5,
      "estimatedLines": 8
    }
  ]
}
```

## Tests à Exécuter

```bash
# Lancer tous les tests e2e
bun test tests/e2e/professor/evaluation-import.spec.ts

# Lancer le serveur de développement pour tester manuellement
bun dev
```

## Points Importants

1. **Validation robuste** : Tous les champs requis sont vérifiés avec messages d'erreur clairs
2. **UX progressive** : 3 étapes claires avec navigation fluide
3. **Flexibilité** : 2 méthodes d'import (upload + paste)
4. **Feedback visuel** : Badges colorés, icônes, messages d'erreur
5. **Tests complets** : 14 tests e2e couvrant tous les scénarios
6. **Accessibilité** : Labels, data-testid, navigation clavier
7. **Responsive** : Fonctionne sur mobile et desktop

## TODO (Améliorations Futures)

- [ ] Intégrer avec un state management global (Zustand ou Context API)
- [ ] Ajouter l'évaluation importée à la liste du dashboard en temps réel
- [ ] Persister les évaluations dans le localStorage ou une API
- [ ] Ajouter un bouton "Télécharger exemple" pour donner un template JSON
- [ ] Support pour l'import de plusieurs évaluations en batch
- [ ] Validation plus poussée (dates cohérentes, limites de durée, etc.)
- [ ] Prévisualisation en mode "diff" pour comparer avec une évaluation existante
