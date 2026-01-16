# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Aide-Prof" est une application web d'assistant d'évaluation éducatif permettant aux professeurs de créer des évaluations, scanner et corriger automatiquement les copies d'étudiants avec l'aide de l'IA. Les étudiants peuvent consulter leurs résultats en ligne.

**Stack technique:**
- **Frontend:** React 19.2 + TypeScript 5.9 + Vite 7.x + Tailwind CSS 4.x + React Router 7.11
- **Backend:** Hono.js + Drizzle ORM + PostgreSQL + Zod

## Development Commands

### Démarrage Simplifié avec `bun dev`

Le projet utilise un **script de démarrage intelligent** (`scripts/dev-start.ts`) qui gère automatiquement toute la configuration :

```bash
# Première fois : installer les dépendances
bun install
cd server && bun install && cd ..

# Démarrage (une seule commande !)
bun dev
```

**Le script `bun dev` fait automatiquement :**
1. Démarre PostgreSQL via Docker si pas déjà lancé
2. Attend que PostgreSQL soit prêt
3. Push le schéma Drizzle si les tables n'existent pas
4. Seed la base de données si pas de données
5. Lance le backend (http://localhost:3000) et le frontend (http://localhost:5173) en parallèle

**Plus besoin de lancer Docker manuellement !**

### Frontend (racine du projet)

**First-time setup:**
```bash
bun install
```

**Development server:**
```bash
bun dev
# Démarre sur http://localhost:5173 (frontend) + http://localhost:3000 (backend)
```

**Build for production:**
```bash
bun run build
# 1. Compile TypeScript avec type checking (tsc -b)
# 2. Build Vite pour production (minified, optimized)
# Output: dist/
```

**Linting:**
```bash
bun run lint
# ESLint avec flat config, TypeScript ESLint, React Hooks
```

**Preview production build:**
```bash
bun run preview
# Sert le build de production localement pour tester
```

### Backend (dossier /server)

**First-time setup:**
```bash
cd server
bun install
```

**Note:** En développement normal, utilisez `bun dev` depuis la racine du projet. Cette commande démarre automatiquement PostgreSQL et le backend.

**Démarrer PostgreSQL manuellement (si nécessaire):**
```bash
docker compose up -d postgres
# Démarre PostgreSQL sur localhost:5432
# User: aideprof, Password: aideprof_secret, DB: aideprof
```

**Development server (backend seul):**
```bash
cd server
bun dev
# Démarre sur http://localhost:3000
# Hot reload avec tsx watch
```

**Build for production:**
```bash
cd server
bun run build
# Output: server/dist/
```

**Base de données (Drizzle):**
```bash
cd server
bun run db:generate  # Génère les migrations
bun run db:migrate   # Applique les migrations
bun run db:push      # Push direct vers la DB (dev)
bun run db:studio    # Interface web Drizzle Studio
bun run db:seed      # Insère les données de test
```

### Tests E2E (Playwright)

Le projet utilise **Playwright** pour les tests end-to-end avec un **script de démarrage intelligent** (`scripts/test-e2e-start.ts`).

**Lancer les tests (une seule commande !) :**
```bash
bun run test:e2e
```

**Le script `bun run test:e2e` fait automatiquement :**
1. Démarre PostgreSQL (test) via Docker si pas déjà lancé
2. Attend que PostgreSQL soit prêt
3. Push le schéma Drizzle si les tables n'existent pas
4. Seed la base de données test
5. Lance les tests E2E avec Playwright

**Plus besoin de setup manuel !**

**Commandes disponibles:**
```bash
bun run test:e2e         # Lance tous les tests E2E
bun run test:e2e:ui      # Lance les tests avec interface graphique
bun run test:e2e:debug   # Lance les tests en mode debug
bun run test:e2e:headed  # Lance les tests en mode visible (avec navigateur)
bun run test:e2e:report  # Affiche le rapport des tests
bun run test:e2e:cleanup # Arrête le container PostgreSQL test
```

**Filtrer les tests :**
```bash
bun run test:e2e -- --grep "login"           # Tests contenant "login"
bun run test:e2e -- --project=chromium       # Uniquement sur Chromium
bun run test:e2e -- tests/e2e/auth/          # Uniquement les tests d'auth
```

**Structure des tests:**
```
tests/e2e/
├── auth/
│   ├── login.spec.ts     # Tests de connexion
│   └── logout.spec.ts    # Tests de déconnexion
├── professor/
│   ├── dashboard.spec.ts        # Tests du tableau de bord
│   └── evaluation-import.spec.ts # Tests d'import d'évaluations
└── navigation/
    └── sidebar.spec.ts   # Tests de navigation
```

**Règle importante:** Les tests E2E doivent utiliser des `data-testid` pour identifier les éléments (voir `.claude/rules/test-e2e-with-test-id.md`).

## Git Workflow et Convention de Branches

**IMPORTANT:** Ce projet suit une convention stricte de branching pour maintenir un workflow de développement organisé.

### Règle de Branching

**Toute nouvelle fonctionnalité DOIT être développée dans une branche feature séparée** suivant la convention :

```
feature/short-name-of-the-feature
```

**Exemples de noms de branches valides:**
- `feature/student-dashboard`
- `feature/pdf-export`
- `feature/auto-correction`
- `fix/login-bug`
- `refactor/evaluation-form`

### Workflow Standard

1. **Créer une branche depuis main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nom-fonctionnalite
   ```

2. **Développer et tester:**
   ```bash
   # Faire les modifications...
   bun run build  # Vérifier que le build fonctionne
   bun run lint   # Vérifier le linting
   ```

3. **Commiter et pousser:**
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   git push -u origin feature/nom-fonctionnalite
   ```

4. **Créer une Pull Request:**
   ```bash
   gh pr create --title "Titre de la PR" --body "Description..."
   ```

5. **Après révision et approbation, merger dans main**

### Règles Strictes

- ❌ **JAMAIS** commit directement sur `main`
- ✅ **TOUJOURS** créer une branche feature pour toute nouvelle fonctionnalité
- ✅ **TOUJOURS** créer une PR avant de merger dans `main`
- ✅ **TOUJOURS** s'assurer que `bun run build` fonctionne avant de pousser
- ✅ **TOUJOURS** demander une révision de code avant le merge

**Voir `.claude/rules/git-workflow.md` pour plus de détails.**

**Dépôt GitHub:** https://github.com/elycheikhsmail/aide-prof

## Règles Claude Code

Le projet contient des règles spécifiques pour Claude Code dans `.claude/rules/` :

| Fichier | Description |
|---------|-------------|
| `git-workflow.md` | Convention de branches et workflow Git |
| `ci-cd.md` | Toujours vérifier que `bun run build` fonctionne après modifications |
| `validate-implemention-code.md` | Processus de validation : TypeScript, build, tests E2E |
| `test-e2e-with-test-id.md` | Utiliser `data-testid` pour les sélecteurs E2E (pas de texte) |
| `where-write-md-files.md` | Écrire les fichiers markdown dans `./CLAUDE_FILES/` |

**Processus de validation après implémentation :**
1. ✔ Vérification TypeScript (`tsc --noEmit`)
2. ✔ Build réussit (`bun run build`)
3. ✔ Tests E2E pertinents passent
4. ✔ Créer/mettre à jour les tests E2E pour les nouvelles fonctionnalités

**Communication :** Le français est la langue de communication par défaut.

## Architecture du Projet

### Structure des Dossiers

**Frontend (`/frontend`):**
```
frontend/
├── components/
│   ├── ui/              # Composants UI réutilisables (Button, Card, Badge, etc.)
│   ├── layout/          # Composants de layout (Header, Sidebar, MainLayout)
│   ├── professor/       # Composants spécifiques aux professeurs
│   └── student/         # Composants spécifiques aux étudiants
├── pages/
│   ├── professor/       # Pages professeur (Dashboard, Evaluations, etc.)
│   └── student/         # Pages étudiant (à implémenter)
├── contexts/            # Contextes React (Auth, Evaluations, Classes)
├── services/            # Services API (api.ts, subjectsApi.ts)
├── types/
│   └── index.ts         # Types TypeScript partagés
├── utils/               # Fonctions utilitaires (pdfGenerator, validators)
├── hooks/               # Custom React hooks
├── config/              # Configuration (env.ts)
├── App.tsx              # Composant principal avec navigation
├── main.tsx             # Point d'entrée
└── index.css            # Styles globaux Tailwind
```

**Backend (`/server`):**
```
server/
├── package.json         # Dépendances backend
├── tsconfig.json        # Config TypeScript serveur
├── drizzle.config.ts    # Config Drizzle (migrations)
└── src/
    ├── index.ts         # Point d'entrée Hono
    ├── config/
    │   ├── env.ts       # Variables d'environnement
    │   └── database.ts  # Connexion PostgreSQL (abstraction DB)
    ├── db/
    │   ├── schema/      # Schémas Drizzle (tables)
    │   ├── migrations/  # Migrations SQL
    │   └── seed.ts      # Données de test
    ├── repositories/    # Couche d'abstraction DB (pattern Repository)
    ├── services/        # Logique métier
    ├── routes/          # Routes API Hono
    ├── middlewares/     # Auth, error handling
    ├── validators/      # Schémas Zod
    └── types/           # Types partagés backend
```

**Tests E2E (`/tests`):**
```
tests/
└── e2e/
    ├── auth/            # Tests authentification (login, logout)
    ├── professor/       # Tests interface professeur
    └── navigation/      # Tests navigation (sidebar)
```

**Scripts (`/scripts`):**
```
scripts/
├── dev-start.ts         # Script de démarrage intelligent (développement)
└── test-e2e-start.ts    # Script de démarrage intelligent (tests E2E)
```

### Architecture de Navigation

L'application utilise **React Router DOM** pour la navigation:

- **App.tsx**: Composant racine avec `BrowserRouter` et composant interne `AppContent`
- **AppContent**: Utilise `useLocation` et `useNavigate` pour gérer la navigation
- **Routes**: Définies dans `App.tsx` avec `Routes` et `Route`
- **MainLayout**: Wrapper qui inclut Header + Sidebar + contenu principal
- **Sidebar**: Utilise `NavLink` pour la navigation avec indication visuelle de la page active
- **Header**: Logo cliquable avec `Link` vers le dashboard

**Routes configurées:**
- `/` → ProfessorDashboard (page complète avec statistiques et données)
- `/evaluations` → Evaluations (liste paginée avec actions)
- `/evaluations/create` → CreateEvaluation (formulaire en 3 étapes)
- `/classes` → Classes (placeholder)
- `/statistics` → Statistics (placeholder)
- `/settings` → Settings (placeholder)

### Système de Design

**Palette de Couleurs:**
- Primaire: `blue-600` (#2563EB) - personnalisée dans tailwind.config.js
- Succès: `green-500` (#10B981)
- Attention: `orange-500` (#F59E0B)
- Erreur: `red-500` (#EF4444)
- Neutre: `gray-600` (#6B7280)
- Fond: `gray-50` (background), `white` (cards)

**Composants UI Disponibles:**
Tous exportés depuis `src/components/ui/index.ts`:
- `Button` - variants: primary, secondary, outline, ghost, danger
- `Card` - avec header/footer optionnels
- `Badge` - variants: success, warning, error, info, neutral
- `Input`, `Select`, `Textarea` - formulaires avec labels et erreurs
- `StatCard` - cartes de statistiques avec icônes et tendances
- `Modal` - modales avec backdrop, titre, footer personnalisable

**Composants Layout:**
Exportés depuis `src/components/layout/index.ts`:
- `Header` - Barre de navigation avec logo, nom utilisateur, bouton déconnexion
- `Sidebar` - Menu latéral avec navigation et état actif
- `MainLayout` - Layout principal qui combine Header + Sidebar + children

### Types de Données

**Entités principales** (voir `src/types/index.ts` et `server/src/db/schema/`):
- `User` - Utilisateur (professeur ou étudiant)
- `Class` - Classe d'étudiants
- `Evaluation` - Évaluation/examen avec questions
- `Question` - Question d'une évaluation avec barème
- `StudentCopy` - Copie d'étudiant scannée
- `Answer` - Réponse d'un étudiant avec score AI
- `Student` - Étudiant avec statistiques
- `Session` - Session d'authentification

### API Backend

**Base URL:** `http://localhost:3000/api/v1`

**Routes d'authentification (`/auth`):**
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `GET /auth/me` - Utilisateur courant

**Routes classes (`/classes`):**
- `GET /classes` - Liste des classes du professeur
- `POST /classes` - Créer une classe
- `GET /classes/:id` - Détail d'une classe
- `PATCH /classes/:id` - Modifier une classe
- `DELETE /classes/:id` - Supprimer une classe
- `GET /classes/:id/students` - Étudiants d'une classe

**Routes évaluations (`/evaluations`):**
- `GET /evaluations` - Liste des évaluations (avec questions)
- `POST /evaluations` - Créer une évaluation (avec questions optionnelles)
- `GET /evaluations/:id` - Détail d'une évaluation
- `PATCH /evaluations/:id` - Modifier une évaluation
- `DELETE /evaluations/:id` - Supprimer une évaluation
- `GET /evaluations/:id/questions` - Questions d'une évaluation
- `POST /evaluations/:id/questions` - Ajouter une question
- `GET /evaluations/:id/copies` - Copies d'étudiants

**Création d'évaluation avec questions (POST /evaluations):**
```json
{
  "title": "Évaluation Maths T1",
  "subject": "Mathématiques",
  "date": "2025-01-20",
  "duration": 120,
  "totalPoints": 20,
  "classIds": ["uuid1", "uuid2"],
  "questions": [
    {
      "number": 1,
      "statement": "Calculer l'intégrale...",
      "modelAnswer": "La réponse est...",
      "points": 5,
      "estimatedLines": 10
    }
  ]
}
```

**Routes étudiants (`/students`):**
- `GET /students` - Liste des étudiants
- `POST /students` - Créer un étudiant
- `GET /students/:id` - Détail d'un étudiant
- `PATCH /students/:id` - Modifier un étudiant
- `DELETE /students/:id` - Supprimer un étudiant
- `GET /students/:id/results` - Résultats d'un étudiant

### Architecture Backend - Abstraction DB

Le backend utilise le **pattern Repository** pour abstraire la base de données, permettant de changer facilement de DB (PostgreSQL → MySQL) :

```
Routes → Services → Repositories → Drizzle ORM → PostgreSQL
```

**Pour changer de base de données :**
1. Modifier `server/src/config/database.ts` (connexion)
2. Adapter les schémas dans `server/src/db/schema/` (syntaxe Drizzle)
3. Les repositories et services restent inchangés

### Données Mockées

Le fichier `src/data/mockData.ts` contient des données complètes pour le développement:
- 1 professeur (Dr. Marie Dubois)
- 3 classes (Maths, Physique, Chimie)
- 5 évaluations avec différents statuts (draft, active, correcting, completed)
- 20 étudiants avec notes et classements
- Statistiques globales et notifications

## Configuration Technique

**TypeScript:**
- Mode strict activé avec linting strict (noUnusedLocals, noUnusedParameters)
- Project references: `tsconfig.app.json` (app) + `tsconfig.node.json` (build config)
- Target: ES2022, JSX mode: react-jsx (automatic React 19)
- Module resolution: bundler (pas besoin d'extensions .ts/.tsx dans imports)

**Tailwind CSS:**
- Version 4.x avec PostCSS plugin `@tailwindcss/postcss`
- Configuration dans `tailwind.config.js`
- Couleur primaire personnalisée (blue-600) avec nuances 50-900
- **IMPORTANT:** Utilise la syntaxe v4 `@import "tailwindcss"` dans `src/index.css`
  - Ne PAS utiliser `@tailwind base/components/utilities` (syntaxe v3)

**ESLint:**
- Flat config format (`eslint.config.js`, pas `.eslintrc`)
- Extensions utilisées: TypeScript ESLint, React Hooks, React Refresh
- Ignore `dist/` automatiquement
- Fonctionne sur fichiers `**/*.{ts,tsx}` uniquement

**Icônes:**
- Lucide React (v0.562.0) - toutes les icônes
- Import: `import { IconName } from 'lucide-react'`
- Exemple: `<FileText className="w-5 h-5" />`

## Fonctionnalités Implémentées

**Interface Professeur:**
1. ✅ Dashboard complet avec:
   - 4 cartes de statistiques (StatCard avec tendances)
   - Table des évaluations récentes avec badges de statut
   - Liste des notifications avec indicateurs colorés
   - Modal de création d'évaluation (formulaire avec Input/Select)
2. ✅ Layout avec Header et Sidebar fonctionnels
3. ✅ Navigation avec React Router DOM (routes et NavLink)
4. ✅ Page Évaluations complète avec:
   - Liste paginée (10 évaluations par page)
   - Boutons Suivant/Précédent en haut et en bas de la liste
   - Bouton Actualiser pour rafraîchir la liste
   - Bouton Aperçu PDF (ouvre le PDF dans un nouvel onglet)
   - Bouton Générer PDF (télécharge le PDF)
   - Bouton Supprimer (icône poubelle rouge)
   - Import d'évaluations via JSON (avec questions)
5. ✅ Création d'évaluation (formulaire en 3 étapes):
   - Étape 1: Informations générales (titre, matière, classe, date, durée, total points)
   - Étape 2: Contenu de l'évaluation (formulaires spécifiques par matière)
   - Étape 3: Aperçu et validation
6. ✅ Génération de PDF:
   - Option 1: Feuille unique (questions + espaces de réponse)
   - Option 2: Feuilles séparées (questions / réponses)
   - Support de l'arabe (RTL, police Amiri)
7. ✅ Pages placeholder pour Classes, Statistiques, Paramètres

**À Implémenter:**
- Pages: Classes, Statistiques, Paramètres (contenu)
- Scanner de copies (upload PDF/images)
- Association copies-étudiants (OCR + suggestions)
- Révision et correction des copies
- Résultats détaillés avec graphiques et exports
- Interface étudiant complète

## Notes de Développement

**État actuel:**
- Package manager: Bun (recommandé)
- ✅ Navigation avec React Router DOM 7.11 implémentée
- ✅ Backend Hono.js avec API REST complète
- ✅ Base de données PostgreSQL avec Drizzle ORM
- ✅ Authentification par sessions côté serveur
- ✅ Pattern Repository pour abstraction DB
- ✅ Script de démarrage intelligent (`bun dev`)
- ✅ Tests E2E avec Playwright (auth, dashboard, navigation)
- ✅ Layout principal (Header + Sidebar) complètement fonctionnel
- ✅ Dashboard professeur complètement implémenté
- ✅ Page Évaluations connectée au backend (CRUD complet)
- ✅ Contextes React pour la gestion d'état (Auth, Evaluations, Classes)
- ✅ Génération de PDF avec html2pdf.js
- ✅ Import d'évaluations via JSON avec validation

**À implémenter:**
- Contenu des pages Classes, Statistiques, Paramètres
- Formulaire de création d'évaluation: envoyer les questions au backend
- Scanner de copies (upload PDF/images)
- Interface étudiant complète

**Conventions de code:**
- Utiliser les composants UI depuis `frontend/components/ui/index.ts`
- Utiliser les composants layout depuis `frontend/components/layout/index.ts`
- Utiliser les contextes depuis `frontend/contexts/`
- Imports de types avec `import type { ... }` pour optimiser le bundle
- Classes Tailwind: mobile-first, utiliser les breakpoints `md:` et `lg:`
- Nommer les composants en PascalCase, fichiers en PascalCase.tsx
- Props interfaces nommées `[ComponentName]Props`
- Utiliser `data-testid` pour les éléments testables E2E

**Patterns d'utilisation:**
```tsx
// Import des composants UI
import { Button, Card, Badge, StatCard, Modal } from '../../components/ui';

// Import des composants layout
import { MainLayout, Header, Sidebar } from '../../components/layout';

// Import des contextes
import { useEvaluations } from '../../contexts/EvaluationsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useClasses } from '../../contexts/ClassesContext';

// Import React Router
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

// Import des types
import type { Evaluation, Student } from '../../types';

// Import des utilitaires PDF
import { generateCombinedSheet, previewCombinedSheet } from '../../utils/pdfGeneratorHtml2Pdf';

// Utilisation du contexte Evaluations
const { evaluations, addEvaluation, removeEvaluation, refreshEvaluations, isLoading } = useEvaluations();

// Création d'une évaluation avec questions
await addEvaluation({
  title: 'Mon évaluation',
  subject: 'Mathématiques',
  date: '2025-01-20',
  duration: 120,
  totalPoints: 20,
  questions: [
    { number: 1, statement: 'Question 1', points: 5, estimatedLines: 5 }
  ]
});

// Utilisation de la navigation programmatique
const navigate = useNavigate();
navigate('/evaluations'); // Navigue vers /evaluations
navigate('/evaluations/create'); // Navigue vers création
navigate(-1); // Retour arrière
```
