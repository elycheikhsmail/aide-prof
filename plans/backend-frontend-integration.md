# Plan d'Intégration Backend-Frontend

## État Actuel

### Backend (`/server`)
- **Framework**: Hono.js avec Node.js
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Port**: 3000
- **API Base URL**: `http://localhost:3000/api/v1`
- **Authentification**: Session-based avec cookies HttpOnly
- **CORS**: Configuré pour `http://localhost:5173` et `http://localhost:3000`

**Routes disponibles**:
- `/api/v1/auth` - Authentification (login, register, logout, me)
- `/api/v1/evaluations` - Gestion des évaluations
- `/api/v1/classes` - Gestion des classes
- `/api/v1/students` - Gestion des étudiants
- `/api/v1/users` - Gestion des utilisateurs

### Frontend (`/src`)
- **Framework**: React 19 avec TypeScript
- **Build Tool**: Vite
- **Port**: 5173 (par défaut)
- **État actuel**: Utilise des données mockées et une authentification simulée
- **API Service**: Déjà créé dans [`src/services/api.ts`](../src/services/api.ts) mais non utilisé

## Problèmes Identifiés

### 1. Contextes Non Connectés
- [`AuthContext.tsx`](../src/contexts/AuthContext.tsx) utilise une authentification simulée en mémoire
- [`EvaluationsContext.tsx`](../src/contexts/EvaluationsContext.tsx) utilise des données mockées
- Aucune communication avec le backend réel

### 2. Configuration Manquante
- Pas de fichier `.env` pour le frontend
- Pas de proxy configuré dans Vite
- URL de l'API hardcodée dans [`api.ts`](../src/services/api.ts)

### 3. Gestion d'État
- Pas de gestion des états de chargement
- Pas de gestion d'erreurs réseau
- Pas de persistance de session

### 4. Différences de Types
- Frontend utilise `role: 'prof' | 'eleve'`
- Backend utilise `role: 'professor' | 'student'`
- Nécessite une normalisation

## Architecture d'Intégration

```mermaid
graph TB
    subgraph Frontend
        A[React App :5173] --> B[AuthContext]
        A --> C[EvaluationsContext]
        B --> D[API Service]
        C --> D
    end
    
    subgraph Backend
        E[Hono Server :3000] --> F[Auth Routes]
        E --> G[Evaluations Routes]
        E --> H[Classes Routes]
        F --> I[PostgreSQL]
        G --> I
        H --> I
    end
    
    D -->|HTTP + Cookies| E
    
    style A fill:#61dafb
    style E fill:#ff6b6b
    style I fill:#336791
```

## Plan d'Action Détaillé

### Phase 1: Configuration de l'Environnement

#### 1.1 Créer le fichier d'environnement frontend
**Fichier**: `.env`
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

#### 1.2 Créer un fichier de configuration
**Fichier**: [`src/config/env.ts`](../src/config/env.ts)
```typescript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
```

#### 1.3 Configurer le proxy Vite
**Fichier**: [`vite.config.ts`](../vite.config.ts)
```typescript
export default defineConfig({
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

### Phase 2: Mise à Jour du Service API

#### 2.1 Améliorer le service API
**Fichier**: [`src/services/api.ts`](../src/services/api.ts)

**Modifications nécessaires**:
- Utiliser la configuration d'environnement
- Ajouter un intercepteur pour gérer les erreurs globalement
- Ajouter un timeout pour les requêtes
- Améliorer la gestion des erreurs réseau
- Ajouter des types pour les erreurs

**Nouvelles fonctionnalités**:
```typescript
// Gestion des erreurs
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Intercepteur de requêtes
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Une erreur est survenue',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError('La requête a expiré', 408);
    }
    
    throw new ApiError('Erreur de connexion au serveur');
  }
}
```

### Phase 3: Mise à Jour de AuthContext

#### 3.1 Refactoriser AuthContext
**Fichier**: [`src/contexts/AuthContext.tsx`](../src/contexts/AuthContext.tsx)

**Changements majeurs**:
1. Remplacer l'authentification simulée par des appels API réels
2. Ajouter la gestion des états de chargement
3. Ajouter la persistance de session
4. Normaliser les types de rôles
5. Gérer la vérification de session au chargement

**Nouvelle structure**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'professor' | 'student';
  photo: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'professor' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

**Fonctionnalités**:
- Vérification de session au montage du composant
- Gestion automatique des erreurs
- États de chargement pour les opérations async
- Redirection automatique après login/logout

### Phase 4: Mise à Jour de EvaluationsContext

#### 4.1 Refactoriser EvaluationsContext
**Fichier**: [`src/contexts/EvaluationsContext.tsx`](../src/contexts/EvaluationsContext.tsx)

**Changements majeurs**:
1. Remplacer les données mockées par des appels API
2. Ajouter le chargement initial depuis le backend
3. Synchroniser les opérations CRUD avec le backend
4. Ajouter la gestion des états de chargement
5. Gérer les erreurs API

**Nouvelle structure**:
```typescript
interface EvaluationsContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;
  addEvaluation: (evaluation: CreateEvaluationData) => Promise<Evaluation>;
  removeEvaluation: (id: string) => Promise<void>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<Evaluation>;
  refreshEvaluations: () => Promise<void>;
  clearError: () => void;
}
```

### Phase 5: Mise à Jour des Composants UI

#### 5.1 Ajouter des composants de feedback
**Nouveaux composants nécessaires**:
- `LoadingSpinner` - Pour les états de chargement
- `ErrorAlert` - Pour afficher les erreurs
- `Toast` - Pour les notifications

#### 5.2 Mettre à jour les pages
**Pages à modifier**:
- [`Login.tsx`](../src/pages/auth/Login.tsx) - Gérer les états async
- [`Register.tsx`](../src/pages/auth/Register.tsx) - Gérer les états async
- [`Dashboard.tsx`](../src/pages/professor/Dashboard.tsx) - Afficher les données réelles
- [`Evaluations.tsx`](../src/pages/professor/Evaluations.tsx) - CRUD avec backend
- [`Classes.tsx`](../src/pages/professor/Classes.tsx) - CRUD avec backend

### Phase 6: Gestion des Classes

#### 6.1 Créer ClassesContext
**Nouveau fichier**: `src/contexts/ClassesContext.tsx`

Similaire à EvaluationsContext mais pour les classes:
```typescript
interface ClassesContextType {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  addClass: (classData: CreateClassData) => Promise<Class>;
  removeClass: (id: string) => Promise<void>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<Class>;
  refreshClasses: () => Promise<void>;
  clearError: () => void;
}
```

### Phase 7: Normalisation des Types

#### 7.1 Créer un fichier de mapping
**Fichier**: `src/utils/typeMappers.ts`

```typescript
// Mapper les rôles backend vers frontend
export function mapBackendRole(role: 'professor' | 'student'): 'prof' | 'eleve' {
  return role === 'professor' ? 'prof' : 'eleve';
}

// Mapper les rôles frontend vers backend
export function mapFrontendRole(role: 'prof' | 'eleve'): 'professor' | 'student' {
  return role === 'prof' ? 'professor' : 'student';
}

// Mapper les utilisateurs backend vers frontend
export function mapBackendUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    photo: apiUser.photo,
  };
}
```

### Phase 8: Gestion des Erreurs Globale

#### 8.1 Créer un ErrorBoundary
**Fichier**: `src/components/ErrorBoundary.tsx`

Pour capturer les erreurs React non gérées.

#### 8.2 Créer un hook useApiError
**Fichier**: `src/hooks/useApiError.ts`

```typescript
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Une erreur inattendue est survenue');
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
```

### Phase 9: Tests et Validation

#### 9.1 Tests d'intégration
**Scénarios à tester**:
1. **Authentification**
   - Login avec credentials valides
   - Login avec credentials invalides
   - Register nouveau utilisateur
   - Logout
   - Persistance de session après refresh

2. **Évaluations**
   - Charger la liste des évaluations
   - Créer une nouvelle évaluation
   - Modifier une évaluation
   - Supprimer une évaluation
   - Ajouter des questions

3. **Classes**
   - Charger la liste des classes
   - Créer une nouvelle classe
   - Modifier une classe
   - Supprimer une classe

#### 9.2 Tests E2E
Mettre à jour les tests Playwright existants pour utiliser le backend réel.

### Phase 10: Documentation

#### 10.1 Créer un guide de démarrage
**Fichier**: `docs/INTEGRATION_SETUP.md`

Instructions pour:
- Démarrer la base de données
- Démarrer le backend
- Démarrer le frontend
- Configuration des variables d'environnement

#### 10.2 Mettre à jour le README
Ajouter les instructions d'intégration au README principal.

## Ordre d'Exécution Recommandé

1. **Configuration** (Phase 1)
   - Créer les fichiers d'environnement
   - Configurer Vite proxy

2. **Service API** (Phase 2)
   - Améliorer la gestion des erreurs
   - Ajouter les timeouts

3. **AuthContext** (Phase 3)
   - Intégrer l'API d'authentification
   - Tester le flow complet

4. **EvaluationsContext** (Phase 4)
   - Intégrer l'API des évaluations
   - Tester les opérations CRUD

5. **ClassesContext** (Phase 6)
   - Créer et intégrer le contexte
   - Tester les opérations CRUD

6. **UI Updates** (Phase 5)
   - Ajouter les composants de feedback
   - Mettre à jour les pages

7. **Types & Errors** (Phases 7-8)
   - Normaliser les types
   - Ajouter la gestion d'erreurs globale

8. **Tests** (Phase 9)
   - Tests d'intégration
   - Tests E2E

9. **Documentation** (Phase 10)
   - Guide de setup
   - README

## Points d'Attention

### Sécurité
- ✅ Cookies HttpOnly pour les sessions
- ✅ CORS configuré correctement
- ⚠️ Ajouter HTTPS en production
- ⚠️ Valider les entrées côté frontend

### Performance
- Ajouter un cache pour les données fréquemment accédées
- Implémenter le lazy loading pour les listes longues
- Optimiser les re-renders avec React.memo

### UX
- Afficher des loaders pendant les requêtes
- Afficher des messages d'erreur clairs
- Ajouter des confirmations pour les actions destructives
- Implémenter un système de notifications toast

### Compatibilité
- Tester sur différents navigateurs
- Gérer les cas de déconnexion réseau
- Gérer les timeouts de session

## Dépendances à Installer

### Frontend
Aucune nouvelle dépendance requise - tout est déjà disponible.

### Backend
Vérifier que le backend a:
- ✅ Hono avec CORS
- ✅ Drizzle ORM
- ✅ PostgreSQL
- ✅ Bcrypt pour les mots de passe

## Configuration Requise

### Variables d'Environnement

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://aideprof:aideprof_secret@localhost:5432/aideprof
SESSION_SECRET=your-super-secret-key-change-in-production
SESSION_MAX_AGE=86400000
```

### Scripts NPM

**Root `package.json`** - Ajouter:
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "dev:server": "cd server && npm run dev"
  }
}
```

## Diagramme de Flux d'Authentification

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as AuthContext
    participant API as API Service
    participant B as Backend
    participant DB as Database

    U->>F: Enter credentials
    F->>A: login(email, password)
    A->>API: authApi.login()
    API->>B: POST /api/v1/auth/login
    B->>DB: Verify credentials
    DB-->>B: User data
    B->>B: Create session
    B-->>API: Set-Cookie + user data
    API-->>A: User object
    A->>A: Update state
    A-->>F: Success
    F->>F: Navigate to dashboard
```

## Diagramme de Flux CRUD Évaluations

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant E as EvaluationsContext
    participant API as API Service
    participant B as Backend
    participant DB as Database

    U->>F: Create evaluation
    F->>E: addEvaluation(data)
    E->>API: evaluationsApi.create()
    API->>B: POST /api/v1/evaluations
    B->>B: Validate data
    B->>DB: Insert evaluation
    DB-->>B: New evaluation
    B-->>API: Evaluation object
    API-->>E: Evaluation
    E->>E: Update local state
    E-->>F: Success
    F->>F: Show success message
```

## Checklist de Validation

### Avant de Commencer
- [ ] Backend est fonctionnel et testé
- [ ] Base de données PostgreSQL est accessible
- [ ] Docker Compose est configuré
- [ ] Variables d'environnement sont définies

### Après l'Intégration
- [ ] Login fonctionne avec le backend
- [ ] Register fonctionne avec le backend
- [ ] Logout fonctionne correctement
- [ ] Session persiste après refresh
- [ ] Évaluations se chargent depuis le backend
- [ ] Création d'évaluation fonctionne
- [ ] Modification d'évaluation fonctionne
- [ ] Suppression d'évaluation fonctionne
- [ ] Classes se chargent depuis le backend
- [ ] CRUD des classes fonctionne
- [ ] Gestion d'erreurs fonctionne
- [ ] États de chargement s'affichent
- [ ] Tests E2E passent
- [ ] Documentation est à jour

## Estimation de Complexité

| Phase | Complexité | Temps Estimé | Priorité |
|-------|-----------|--------------|----------|
| Phase 1: Configuration | Faible | - | Haute |
| Phase 2: Service API | Moyenne | - | Haute |
| Phase 3: AuthContext | Moyenne | - | Haute |
| Phase 4: EvaluationsContext | Moyenne | - | Haute |
| Phase 5: UI Updates | Moyenne | - | Moyenne |
| Phase 6: ClassesContext | Moyenne | - | Moyenne |
| Phase 7: Types | Faible | - | Faible |
| Phase 8: Erreurs | Moyenne | - | Moyenne |
| Phase 9: Tests | Élevée | - | Haute |
| Phase 10: Documentation | Faible | - | Moyenne |

## Risques et Mitigation

### Risque 1: Incompatibilité des Types
**Mitigation**: Créer des mappers de types dès le début

### Risque 2: Problèmes CORS
**Mitigation**: Vérifier la configuration CORS du backend

### Risque 3: Gestion de Session
**Mitigation**: Tester la persistance de session et le refresh

### Risque 4: Erreurs Réseau
**Mitigation**: Implémenter une gestion d'erreurs robuste avec retry

### Risque 5: Performance
**Mitigation**: Ajouter du caching et optimiser les requêtes

## Prochaines Étapes

Une fois l'intégration terminée, considérer:
1. Ajouter un système de cache (React Query ou SWR)
2. Implémenter le WebSocket pour les mises à jour en temps réel
3. Ajouter l'upload de fichiers pour les copies d'étudiants
4. Implémenter la pagination pour les grandes listes
5. Ajouter des filtres et recherche avancée
6. Optimiser les performances avec React.memo et useMemo
7. Ajouter des tests unitaires pour les hooks et contextes
