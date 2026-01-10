# Format JSON Flexible pour l'Import d'Évaluations

## Modifications Apportées

Le validateur accepte maintenant un format JSON plus flexible pour faciliter l'import d'évaluations depuis différentes sources.

## Changements Principaux

### 1. Champ `duration` - Flexible (string ou number)

**Avant :**
```json
{
  "duration": 60
}
```

**Maintenant accepté :**
```json
{
  "duration": "60"
}
```

Le validateur convertit automatiquement la string en number.

### 2. Questions - Champ `text` comme alias de `statement`

**Format original :**
```json
{
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "statement": "Question text here",
      "modelAnswer": "Answer here",
      "points": 5,
      "estimatedLines": 8
    }
  ]
}
```

**Nouveau format accepté :**
```json
{
  "questions": [
    {
      "id": "1767212653557",
      "text": "Question text here",
      "points": 2
    }
  ]
}
```

### 3. Champs Optionnels dans les Questions

Les champs suivants sont maintenant **optionnels** :
- `number` - sera auto-généré (1, 2, 3...)
- `modelAnswer` - défaut: chaîne vide
- `estimatedLines` - défaut: 5

**Champs requis minimaux :**
- `id` (string ou number)
- `text` OU `statement` (string)
- `points` (number)

## Format Minimal Valide

```json
{
  "title": "Titre de l'évaluation",
  "subject": "Matière",
  "date": "2025-01-01",
  "duration": "60",
  "totalPoints": 20,
  "questions": [
    {
      "id": "1",
      "text": "Question 1",
      "points": 10
    },
    {
      "id": "2",
      "text": "Question 2",
      "points": 10
    }
  ]
}
```

## Format Complet (tous les champs)

```json
{
  "id": "eval-123",
  "title": "Titre de l'évaluation",
  "subject": "Matière",
  "date": "2025-01-01",
  "duration": 60,
  "totalPoints": 20,
  "professorId": "prof-1",
  "classIds": ["class-1", "class-2"],
  "status": "draft",
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "statement": "Question text",
      "modelAnswer": "Answer text",
      "points": 10,
      "estimatedLines": 5
    },
    {
      "id": "q2",
      "number": 2,
      "statement": "Question text 2",
      "modelAnswer": "Answer text 2",
      "points": 10,
      "estimatedLines": 8
    }
  ]
}
```

## Exemple Réel - Évaluation en Arabe

Voir le fichier [tests/data/evaluation-arabic-example.json](../tests/data/evaluation-arabic-example.json)

```json
{
  "title": "اختبار التربية الإسلامية – الرابعة إعدادي",
  "subject": "التربية الإسلامية",
  "date": "2025-01-01",
  "duration": "60",
  "totalPoints": 20,
  "questions": [
    {
      "id": "1767212653557",
      "text": "العقيدة (2 نقط)\n\nعرّف الإيمان بالقضاء والقدر...",
      "points": 2
    }
  ]
}
```

## Normalisation Automatique

Lors de l'import, le système normalise automatiquement les données :

**Entrée :**
```json
{
  "title": "Test",
  "subject": "Math",
  "date": "2025-01-01",
  "duration": "60",
  "totalPoints": 10,
  "questions": [
    {
      "id": "1",
      "text": "Question 1",
      "points": 10
    }
  ]
}
```

**Après normalisation :**
```json
{
  "id": "eval-1735660800000",
  "title": "Test",
  "subject": "Math",
  "date": "2025-01-01",
  "duration": 60,
  "totalPoints": 10,
  "professorId": "prof-1",
  "classIds": [],
  "status": "draft",
  "questions": [
    {
      "id": "1",
      "number": 1,
      "statement": "Question 1",
      "modelAnswer": "",
      "points": 10,
      "estimatedLines": 5
    }
  ]
}
```

## Validation

### Champs Requis au Niveau Évaluation
- ✅ `title` (string non vide)
- ✅ `subject` (string non vide)
- ✅ `date` (string format YYYY-MM-DD)
- ✅ `duration` (number ou string convertible en number > 0)
- ✅ `totalPoints` (number > 0)
- ✅ `questions` (array non vide)

### Champs Requis au Niveau Question
- ✅ `id` (string ou number)
- ✅ `text` OU `statement` (string non vide)
- ✅ `points` (number > 0)

### Champs Optionnels avec Valeurs par Défaut
- `id` (évaluation) → `eval-{timestamp}`
- `professorId` → `prof-1`
- `classIds` → `[]`
- `status` → `draft`
- `number` (question) → Index + 1
- `modelAnswer` → `""`
- `estimatedLines` → `5`

## Support Multi-langues

Le système supporte le texte en :
- ✅ Français
- ✅ Arabe
- ✅ Anglais
- ✅ Toute autre langue UTF-8

## Compatibilité

✅ **Format original** (avec statement, modelAnswer, estimatedLines) - Toujours supporté
✅ **Format simplifié** (avec text, sans modelAnswer) - Maintenant supporté
✅ **Format mixte** (certaines questions avec statement, d'autres avec text) - Supporté

## Migration

Si vous avez des données existantes au format simplifié, vous pouvez les importer directement sans modification. Le système s'occupe de la normalisation.
