# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Aide-Prof" est une application web d'assistant d'évaluation éducatif permettant aux professeurs de créer des évaluations, scanner et corriger automatiquement les copies d'étudiants avec l'aide de l'IA. Les étudiants peuvent consulter leurs résultats en ligne.

**Stack technique:**
- **Frontend:** React 19.2 + TypeScript 5.9 + Vite 7.x + Tailwind CSS 4.x + React Router 7.11
- **Backend:** Hono.js + Drizzle ORM + PostgreSQL + Zod

## Development Commands

### Frontend (racine du projet)

**First-time setup:**
```bash
bun install
```

**Development server:**
```bash
bun dev
# Démarre sur http://localhost:5173
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

**Démarrer PostgreSQL avec Docker:**
```bash
docker-compose up -d
# Démarre PostgreSQL sur localhost:5432
# User: aideprof, Password: aideprof_secret, DB: aideprof
```

**Development server:**
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

## Architecture du Projet

### Structure des Dossiers

**Frontend (`/src`):**
```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables (Button, Card, Badge, etc.)
│   ├── layout/          # Composants de layout (Header, Sidebar, MainLayout)
│   ├── professor/       # Composants spécifiques aux professeurs
│   └── student/         # Composants spécifiques aux étudiants
├── pages/
│   ├── professor/       # Pages professeur (Dashboard, etc.)
│   └── student/         # Pages étudiant (à implémenter)
├── data/
│   └── mockData.ts      # Données mockées pour le développement
├── types/
│   └── index.ts         # Types TypeScript partagés
├── hooks/               # Custom React hooks
├── utils/               # Fonctions utilitaires
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
- `/evaluations` → Evaluations (placeholder)
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
- `GET /evaluations` - Liste des évaluations
- `POST /evaluations` - Créer une évaluation
- `GET /evaluations/:id` - Détail d'une évaluation
- `PATCH /evaluations/:id` - Modifier une évaluation
- `DELETE /evaluations/:id` - Supprimer une évaluation
- `GET /evaluations/:id/questions` - Questions d'une évaluation
- `POST /evaluations/:id/questions` - Ajouter une question
- `GET /evaluations/:id/copies` - Copies d'étudiants

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
4. ✅ Pages placeholder pour Évaluations, Classes, Statistiques, Paramètres

**À Implémenter:**
- Pages: Évaluations, Classes, Statistiques, Paramètres
- Création d'évaluations (4 étapes: infos, questions, barème, aperçu)
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
- Layout principal (Header + Sidebar) complètement fonctionnel
- Dashboard professeur complètement implémenté

**À implémenter:**
- Connecter le frontend au backend (remplacer les données mockées)
- State management global si nécessaire (suggéré: Zustand ou Context API)
- Validation de formulaires frontend (suggéré: React Hook Form + Zod)
- Contenu des pages Évaluations, Classes, Statistiques, Paramètres
- Interface étudiant complète

**Conventions de code:**
- Utiliser les composants UI depuis `src/components/ui/index.ts`
- Utiliser les composants layout depuis `src/components/layout/index.ts`
- Imports de types avec `import type { ... }` pour optimiser le bundle
- Classes Tailwind: mobile-first, utiliser les breakpoints `md:` et `lg:`
- Nommer les composants en PascalCase, fichiers en PascalCase.tsx
- Props interfaces nommées `[ComponentName]Props`

**Patterns d'utilisation:**
```tsx
// Import des composants UI
import { Button, Card, Badge, StatCard, Modal } from './components/ui';

// Import des composants layout
import { MainLayout, Header, Sidebar } from './components/layout';

// Import React Router
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

// Import des types
import type { Evaluation, Student } from './types';

// Import des données mockées
import { mockEvaluations, mockStatistics } from './data/mockData';

// Utilisation de la navigation programmatique
const navigate = useNavigate();
navigate('/evaluations'); // Navigue vers /evaluations
navigate(-1); // Retour arrière

// Utilisation de NavLink pour menu actif
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'active-class' : 'inactive-class'}
>
  Dashboard
</NavLink>
```
