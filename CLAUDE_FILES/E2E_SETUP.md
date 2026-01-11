# Configuration des Tests E2E avec Backend Réel

Cette configuration permet d'exécuter les tests E2E avec un backend réel et une base de données dédiée, isolée de l'environnement de développement.

## Architecture

- **Mode Développement** :
  - Frontend : `http://localhost:5173`
  - Backend : `http://localhost:3000`
  - Base de données : `aideprof` (port 5432)

- **Mode Test E2E** :
  - Frontend : `http://localhost:5173` (configuré pour parler au backend de test)
  - Backend : `http://localhost:3001`
  - Base de données : `aideprof_test` (port 5433)

## Commandes Disponibles

### 1. Développement

Pour lancer l'environnement de développement complet (Frontend + Backend) :

```bash
bun run dev
```
*Note : Assurez-vous que la base de données de dev est lancée (`docker-compose up -d postgres`)*

### 2. Tests E2E

Pour lancer les tests E2E (configuration automatique de la DB de test, seed, et lancement des serveurs) :

```bash
bun test:e2e
```

Autres commandes de test :
- `bun test:e2e:ui` : Mode interactif avec interface graphique
- `bun test:e2e:debug` : Mode debug pas à pas
- `bun test:e2e:report` : Afficher le rapport HTML des derniers tests

### 3. Gestion de la Base de Données

- `bun run db:dev:start` : Démarre la DB de développement
- `bun run db:test:start` : Démarre la DB de test

## Fonctionnement Interne

Lorsque vous lancez `bun test:e2e`, le script effectue les actions suivantes :
1. Démarre le conteneur Docker `postgres-test` (port 5433).
2. Pousse le schéma de base de données sur la DB de test.
3. Exécute le script de seed (`server/src/db/seed-test.ts`) pour créer un utilisateur de test et des données initiales.
4. Playwright démarre le Frontend (connecté au backend de test) et le Backend (connecté à la DB de test).
5. Les tests sont exécutés.

## Utilisateur de Test

Le script de seed crée automatiquement cet utilisateur pour les tests :
- **Email** : `ely@gmail.com`
- **Mot de passe** : `1234`
