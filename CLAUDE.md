# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Aide-Prof" est une application web d'assistant d'évaluation éducatif permettant aux professeurs de créer des évaluations, scanner et corriger automatiquement les copies d'étudiants avec l'aide de l'IA. Les étudiants peuvent consulter leurs résultats en ligne.

**Stack technique:** React 19.2 + TypeScript 5.9 + Vite 7.x + Tailwind CSS 4.x + React Router 7.11

## Development Commands

**First-time setup:**
```bash
bun install  # ou npm install
```

**Development server:**
```bash
bun dev      # ou npm run dev
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

**Entités principales** (voir `src/types/index.ts`):
- `User` - Utilisateur (professeur ou étudiant)
- `Class` - Classe d'étudiants
- `Evaluation` - Évaluation/examen avec questions
- `Question` - Question d'une évaluation avec barème
- `StudentCopy` - Copie d'étudiant scannée
- `Answer` - Réponse d'un étudiant avec score AI
- `Student` - Étudiant avec statistiques
- `EvaluationResult` - Résultat d'évaluation avec rang

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
- Package manager: Bun (recommandé) ou npm - les deux fonctionnent
- ✅ Navigation avec React Router DOM 7.11 implémentée
- Toutes les données sont mockées dans `src/data/mockData.ts`
- Layout principal (Header + Sidebar) complètement fonctionnel
- Dashboard professeur complètement implémenté
- Pages professeur créées (Dashboard fonctionnel, autres en placeholder)

**À implémenter:**
- State management global si nécessaire (suggéré: Zustand ou Context API)
- Validation de formulaires (suggéré: React Hook Form + Zod)
- Backend API et authentification
- Contenu des pages Évaluations, Classes, Statistiques, Paramètres

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
