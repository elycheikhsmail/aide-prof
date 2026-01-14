# 📚 Aide-Prof - Assistant d'Évaluation Éducatif

Application web d'assistant d'évaluation permettant aux professeurs de créer des évaluations, scanner et corriger automatiquement les copies d'étudiants avec l'aide de l'IA. Les étudiants peuvent consulter leurs résultats en ligne.

## 🚀 Démarrage Rapide

### Prérequis
- [Bun](https://bun.sh/) - Package manager
- [Docker](https://www.docker.com/) - Pour la base de données PostgreSQL

### Installation et démarrage

```bash
# 1. Installer les dépendances (frontend + backend)
bun install
cd server && bun install && cd ..

# 2. Démarrer PostgreSQL avec Docker (OBLIGATOIRE)
docker compose up -d

# 3. Initialiser la base de données
cd server && bun run db:push && bun run db:seed && cd ..

# 4. Lancer l'application (frontend + backend)
bun dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v1
```

> ⚠️ **Important:** Docker doit être lancé AVANT de démarrer l'application, sinon vous obtiendrez l'erreur `ECONNREFUSED 127.0.0.1:5432`

## 🛠️ Stack Technique

- **React 19.2** - Framework UI
- **TypeScript 5.9** - Typage statique
- **Vite 7.x** - Build tool et dev server
- **Tailwind CSS 4.x** - Framework CSS utilitaire
- **Lucide React** - Bibliothèque d'icônes

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/              # Composants réutilisables (Button, Card, etc.)
│   ├── layout/          # Composants de mise en page
│   ├── professor/       # Composants spécifiques professeurs
│   └── student/         # Composants spécifiques étudiants
├── pages/
│   ├── professor/       # Pages professeur
│   └── student/         # Pages étudiant
├── data/                # Données mockées
├── types/               # Types TypeScript
├── hooks/               # Custom React hooks
└── utils/               # Fonctions utilitaires
```

## ✨ Fonctionnalités

### Interface Professeur
- 📊 Dashboard avec statistiques
- ✍️ Création d'évaluations (4 étapes)
- 📸 Scanner de copies (PDF/images)
- 🔗 Association copies-étudiants avec OCR
- ✏️ Révision et correction des copies
- 📈 Résultats détaillés avec graphiques

### Interface Étudiant
- 📊 Dashboard personnel avec statistiques
- 📋 Consultation des résultats
- 👁️ Visualisation des copies corrigées
- 📄 Téléchargement PDF

## 🎨 Composants UI Disponibles

8 composants réutilisables prêts à l'emploi :

- `Button` - 5 variants (primary, secondary, outline, ghost, danger)
- `Card` - Carte avec header/footer optionnels
- `Badge` - Badge coloré (success, warning, error, info, neutral)
- `Input` - Input avec label et gestion d'erreurs
- `Select` - Select avec options
- `Textarea` - Textarea avec label
- `StatCard` - Carte de statistique avec icône
- `Modal` - Modal avec backdrop

```tsx
import { Button, Card, Badge } from './components/ui';

<Button variant="primary" size="lg">Créer</Button>
<Card header={<h3>Titre</h3>}>Contenu</Card>
<Badge variant="success">Terminé</Badge>
```

## 📖 Documentation

- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Guide de démarrage et prochaines étapes
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Documentation complète de la structure
- **[CLAUDE.md](CLAUDE.md)** - Guide pour Claude Code
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Récapitulatif de la configuration

## 🧪 Données de Test

Le projet inclut des données mockées pour le développement :
- 1 professeur (Dr. Marie Dubois)
- 3 classes (Maths, Physique, Chimie)
- 5 évaluations avec différents statuts
- 20 étudiants avec notes et statistiques

Voir `src/data/mockData.ts`

## 💻 Commandes

```bash
# Développement
bun dev              # Démarrer le serveur de développement
bun run build        # Compiler pour la production
bun run preview      # Prévisualiser le build de production
bun run lint         # Linter le code

# Vérification
bash verify-setup.sh # Vérifier la configuration du projet
```

## 🎯 Prochaines Étapes

1. Créer les composants de layout (Header, Sidebar)
2. Implémenter le Dashboard Professeur
3. Ajouter React Router pour la navigation
4. Créer les pages d'évaluation

Consultez [NEXT_STEPS.md](NEXT_STEPS.md) pour un guide détaillé.

## 🔧 Configuration

### Tailwind CSS
Configuration personnalisée dans `tailwind.config.js` avec palette de couleurs primaire (blue-600).

### TypeScript
Mode strict activé avec project references pour optimiser les performances de compilation.

### ESLint
Configuration flat avec règles React Hooks et React Refresh.

## 📦 Dépendances Principales

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwindcss": "^4.1.18",
  "lucide-react": "^0.562.0"
}
```

## 🤝 Contribution

Ce projet est en cours de développement. Consultez [NEXT_STEPS.md](NEXT_STEPS.md) pour voir les fonctionnalités à implémenter.

## 📝 License

Projet éducatif

---

**Construit avec ❤️ en utilisant React, TypeScript et Tailwind CSS**
