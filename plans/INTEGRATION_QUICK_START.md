# Guide de Démarrage Rapide - Intégration Backend-Frontend

## Vue d'Ensemble

Ce guide vous permet de démarrer rapidement l'intégration entre le backend Hono.js et le frontend React.

## Prérequis

- Node.js 18+ installé
- Docker et Docker Compose installés
- Git installé

## Démarrage Rapide (5 minutes)

### 1. Démarrer la Base de Données

```bash
# Depuis la racine du projet
docker-compose up -d
```

Vérifier que PostgreSQL est démarré:
```bash
docker ps
# Vous devriez voir: aide-prof-db
```

### 2. Configurer le Backend

```bash
# Aller dans le dossier server
cd server

# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances
npm install

# Générer et appliquer les migrations
npm run db:push

# (Optionnel) Seed la base de données avec des données de test
npm run db:seed

# Démarrer le serveur backend
npm run dev
```

Le backend devrait démarrer sur `http://localhost:3000`

### 3. Configurer le Frontend

```bash
# Retourner à la racine
cd ..

# Créer le fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
EOF

# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer le frontend
npm run dev
```

Le frontend devrait démarrer sur `http://localhost:5173`

### 4. Tester l'Application

Ouvrir `http://localhost:5173` dans votre navigateur.

**Identifiants de test** (après seed):
- Email: `ely@gmail.com`
- Mot de passe: `1234`

## Vérification de l'Installation

### Backend Health Check

```bash
curl http://localhost:3000/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T15:00:00.000Z"
}
```

### Base de Données

```bash
# Vérifier la connexion à PostgreSQL
docker exec -it aide-prof-db psql -U aideprof -d aideprof -c "SELECT COUNT(*) FROM users;"
```

### Frontend

Ouvrir `http://localhost:5173` - vous devriez voir la page de login.

## Structure des Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Hono) | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |
| Drizzle Studio | 4983 | http://localhost:4983 |

## Commandes Utiles

### Backend

```bash
cd server

# Développement avec hot reload
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Ouvrir Drizzle Studio (interface DB)
npm run db:studio

# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Push le schéma directement (dev)
npm run db:push

# Seed la base de données
npm run db:seed
```

### Frontend

```bash
# Développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Linter
npm run lint

# Tests E2E
npm run test:e2e

# Tests E2E avec UI
npm run test:e2e:ui
```

### Docker

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer PostgreSQL
docker-compose restart postgres

# Supprimer les volumes (⚠️ efface les données)
docker-compose down -v
```

## Démarrage Simultané (Recommandé)

Pour démarrer le backend et le frontend en même temps:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

Ou installer `concurrently`:

```bash
npm install -g concurrently

# Depuis la racine
concurrently "cd server && npm run dev" "npm run dev"
```

## Résolution des Problèmes Courants

### Erreur: "Port 3000 already in use"

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur: "Cannot connect to database"

```bash
# Vérifier que PostgreSQL est démarré
docker ps

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les logs
docker-compose logs postgres
```

### Erreur: "CORS policy"

Vérifier que:
1. Le backend est démarré sur le port 3000
2. Le frontend est démarré sur le port 5173
3. Les URLs dans [`server/src/index.ts`](../server/src/index.ts) incluent `http://localhost:5173`

### Erreur: "Session expired"

```bash
# Vérifier que SESSION_SECRET est défini dans server/.env
cat server/.env | grep SESSION_SECRET
```

### Frontend ne se connecte pas au backend

1. Vérifier que `.env` existe à la racine avec `VITE_API_URL`
2. Redémarrer le serveur Vite après avoir créé/modifié `.env`
3. Vérifier la console du navigateur pour les erreurs CORS

## Prochaines Étapes

Une fois l'installation vérifiée:

1. ✅ Lire le plan complet: [`plans/backend-frontend-integration.md`](./backend-frontend-integration.md)
2. ✅ Commencer par la Phase 1: Configuration
3. ✅ Suivre les phases dans l'ordre recommandé
4. ✅ Tester chaque phase avant de passer à la suivante

## Ressources

- [Documentation Hono](https://hono.dev/)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)

## Support

En cas de problème:
1. Vérifier les logs du backend: `cd server && npm run dev`
2. Vérifier la console du navigateur (F12)
3. Vérifier les logs Docker: `docker-compose logs -f`
4. Consulter le plan d'intégration détaillé

## Checklist de Démarrage

- [ ] Docker est installé et démarré
- [ ] PostgreSQL est accessible (port 5432)
- [ ] Backend démarre sans erreur (port 3000)
- [ ] Frontend démarre sans erreur (port 5173)
- [ ] Health check backend répond
- [ ] Page de login s'affiche
- [ ] Fichiers `.env` sont créés
- [ ] Base de données est seedée (optionnel)

## État Actuel vs État Cible

### État Actuel ❌
- Frontend utilise des données mockées
- Authentification simulée en mémoire
- Pas de persistance des données
- Pas de communication avec le backend

### État Cible ✅
- Frontend connecté au backend réel
- Authentification avec sessions
- Données persistées en PostgreSQL
- Communication API complète
- Gestion d'erreurs robuste
- États de chargement
- Tests E2E fonctionnels
