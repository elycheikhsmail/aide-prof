# Plan d'Infrastructure E2E avec Backend Réel

## Objectif

Configurer une infrastructure de tests E2E qui utilise :
- Un backend réel avec Hono/Bun
- Une base de données PostgreSQL dédiée aux tests
- Deux modes d'exécution : **dev** et **test**

## Architecture

```mermaid
graph TB
    subgraph "Mode DEV"
        FD[Frontend<br/>localhost:5173]
        BD[Backend<br/>localhost:3000]
        DBD[(PostgreSQL DEV<br/>aideprof:5432)]
    end
    
    subgraph "Mode TEST"
        FT[Frontend<br/>localhost:5173]
        BT[Backend<br/>localhost:3001]
        DBT[(PostgreSQL TEST<br/>aideprof_test:5433)]
        PW[Playwright Tests]
    end
    
    FD --> BD --> DBD
    PW --> FT --> BT --> DBT
    
    style DBD fill:#e8f5e9
    style DBT fill:#fff3e0
    style PW fill:#e1f5fe
```

## Fichiers à Créer/Modifier

### 1. Docker Compose avec deux bases de données

**Fichier:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Base de données de développement
  postgres:
    image: postgres:16-alpine
    container_name: aide-prof-db
    environment:
      POSTGRES_USER: aideprof
      POSTGRES_PASSWORD: aideprof_secret
      POSTGRES_DB: aideprof
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aideprof -d aideprof"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Base de données de test (E2E)
  postgres-test:
    image: postgres:16-alpine
    container_name: aide-prof-db-test
    environment:
      POSTGRES_USER: aideprof_test
      POSTGRES_PASSWORD: aideprof_test_secret
      POSTGRES_DB: aideprof_test
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aideprof_test -d aideprof_test"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 2. Fichiers d'environnement

**Fichier:** `server/.env.development`
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://aideprof:aideprof_secret@localhost:5432/aideprof
SESSION_SECRET=dev-secret-key
SESSION_MAX_AGE=86400000
```

**Fichier:** `server/.env.test`
```env
NODE_ENV=test
PORT=3001
DATABASE_URL=postgres://aideprof_test:aideprof_test_secret@localhost:5433/aideprof_test
SESSION_SECRET=test-secret-key
SESSION_MAX_AGE=86400000
```

**Fichier:** `frontend/.env.development`
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

**Fichier:** `frontend/.env.test`
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_API_TIMEOUT=10000
```

### 3. Scripts dans package.json (racine)

**Fichier:** `package.json`

```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:frontend\" \"bun run dev:backend\"",
    "dev:frontend": "vite",
    "dev:backend": "cd server && bun run dev",
    
    "test:e2e": "bun run test:e2e:setup && playwright test",
    "test:e2e:ui": "bun run test:e2e:setup && playwright test --ui",
    "test:e2e:debug": "bun run test:e2e:setup && playwright test --debug",
    "test:e2e:report": "playwright show-report",
    
    "test:e2e:setup": "docker-compose up -d postgres-test && bun run test:e2e:db:setup",
    "test:e2e:db:setup": "cd server && NODE_ENV=test bun run db:push && NODE_ENV=test bun run db:seed:test",
    "test:e2e:cleanup": "docker-compose stop postgres-test",
    
    "db:dev:start": "docker-compose up -d postgres",
    "db:test:start": "docker-compose up -d postgres-test"
  }
}
```

### 4. Scripts dans server/package.json

**Fichier:** `server/package.json`

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch src/index.ts",
    "dev:test": "NODE_ENV=test tsx watch src/index.ts",
    "start": "node dist/index.js",
    "start:test": "NODE_ENV=test node dist/index.js",
    
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts",
    "db:seed:test": "tsx src/db/seed-test.ts"
  }
}
```

### 5. Configuration Playwright mise à jour

**Fichier:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Démarrer le frontend ET le backend pour les tests
  webServer: [
    {
      command: 'VITE_API_URL=http://localhost:3001/api/v1 bun run dev:frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'cd server && NODE_ENV=test bun run dev:test',
      url: 'http://localhost:3001/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
```

### 6. Script de seed pour les tests

**Fichier:** `server/src/db/seed-test.ts`

```typescript
import { db } from '../config/database';
import { users, classes, evaluations } from './schema';
import bcrypt from 'bcryptjs';

async function seedTestDatabase() {
  console.log('🧪 Seeding test database...');

  // Nettoyer la base de données de test
  await db.delete(evaluations);
  await db.delete(classes);
  await db.delete(users);

  // Créer l'utilisateur de test
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  const [testUser] = await db.insert(users).values({
    name: 'Dr. Marie Dubois',
    email: 'ely@gmail.com',
    password: hashedPassword,
    role: 'professor',
  }).returning();

  console.log('✅ Test user created:', testUser.email);

  // Créer des classes de test
  const [testClass] = await db.insert(classes).values({
    name: 'Mathématiques A',
    subject: 'Mathématiques',
    professorId: testUser.id,
  }).returning();

  console.log('✅ Test class created:', testClass.name);

  // Créer des évaluations de test
  await db.insert(evaluations).values([
    {
      title: 'Contrôle Algèbre Linéaire',
      subject: 'Mathématiques',
      date: '2025-01-15',
      duration: 120,
      totalPoints: 20,
      professorId: testUser.id,
      status: 'completed',
    },
    {
      title: 'Examen Mécanique',
      subject: 'Physique',
      date: '2025-01-20',
      duration: 90,
      totalPoints: 20,
      professorId: testUser.id,
      status: 'correcting',
    },
  ]);

  console.log('✅ Test evaluations created');
  console.log('🎉 Test database seeded successfully!');
  
  process.exit(0);
}

seedTestDatabase().catch((error) => {
  console.error('❌ Error seeding test database:', error);
  process.exit(1);
});
```

### 7. Endpoint de santé pour le backend

**Fichier:** `server/src/routes/health.routes.ts`

```typescript
import { Hono } from 'hono';

const healthRoutes = new Hono();

healthRoutes.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { healthRoutes };
```

### 8. Mise à jour de la configuration env du serveur

**Fichier:** `server/src/config/env.ts`

```typescript
import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';

// Charger le fichier .env approprié selon NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret-change-me',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Commandes Finales

### Mode Développement

```bash
# Démarrer tout (frontend + backend + DB dev)
bun run dev

# Ou séparément :
docker-compose up -d postgres    # DB dev
bun run dev:backend              # Backend sur :3000
bun run dev:frontend             # Frontend sur :5173
```

### Mode Test E2E

```bash
# Lancer les tests E2E (setup automatique)
bun test:e2e

# Mode UI interactif
bun test:e2e:ui

# Mode debug
bun test:e2e:debug

# Voir le rapport
bun test:e2e:report

# Nettoyer après les tests
bun run test:e2e:cleanup
```

## Dépendances à Ajouter

```bash
# Dans le package.json racine
bun add -D concurrently wait-on
```

## Résumé des Ports

| Service | Mode DEV | Mode TEST |
|---------|----------|-----------|
| Frontend | 5173 | 5173 |
| Backend | 3000 | 3001 |
| PostgreSQL | 5432 | 5433 |

## Avantages de cette Architecture

1. **Isolation complète** : La base de données de test est séparée de la base de développement
2. **Reproductibilité** : Le seed de test garantit un état initial connu
3. **Simplicité** : Une seule commande pour lancer les tests
4. **Flexibilité** : Possibilité de lancer dev et test en parallèle
5. **CI/CD Ready** : Configuration adaptée pour l'intégration continue
