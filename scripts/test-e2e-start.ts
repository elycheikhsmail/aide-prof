#!/usr/bin/env bun
/**
 * Script de démarrage intelligent pour les tests E2E
 *
 * Ce script :
 * 1. Démarre PostgreSQL (test) via Docker si pas déjà lancé
 * 2. Attend que PostgreSQL soit prêt
 * 3. Push le schéma Drizzle si les tables n'existent pas
 * 4. Seed la DB test
 * 5. Lance les tests E2E avec Playwright
 */

import { $ } from 'bun';

const CONTAINER_NAME = 'aide-prof-db-test';
const MINIO_CONTAINER_NAME = 'aide-prof-minio';
const DB_USER = 'aideprof_test';
const DB_NAME = 'aideprof_test';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: string) {
  console.log(`\n${colors.bold}${colors.cyan}[${step}]${colors.reset}`);
}

async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const result =
      await $`docker ps --filter "name=${containerName}" --filter "status=running" --format "{{.Names}}"`.quiet();
    return result.text().trim() === containerName;
  } catch {
    return false;
  }
}

async function startPostgres(): Promise<void> {
  logStep('1. Vérification de PostgreSQL (test)');

  if (await isContainerRunning(CONTAINER_NAME)) {
    log('  ✓ PostgreSQL (test) est déjà en cours d\'exécution', 'green');
    return;
  }

  log('  → Démarrage de PostgreSQL (test) via Docker...', 'yellow');
  await $`docker compose up -d postgres-test`.quiet();
  log('  ✓ Container démarré', 'green');
}

async function startMinio(): Promise<void> {
  logStep('3. Vérification de MinIO');

  if (await isContainerRunning(MINIO_CONTAINER_NAME)) {
    log('  ✓ MinIO est déjà en cours d\'exécution', 'green');
    return;
  }

  log('  → Démarrage de MinIO via Docker...', 'yellow');
  await $`docker compose up -d minio`.quiet();
  log('  ✓ Container démarré', 'green');
}

async function waitForPostgres(maxAttempts = 30): Promise<void> {
  logStep('2. Attente de PostgreSQL (test)');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await $`docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME}`.quiet();
      if (result.exitCode === 0) {
        log('  ✓ PostgreSQL (test) est prêt!', 'green');
        return;
      }
    } catch {
      // Ignore l'erreur et réessaie
    }

    if (attempt === maxAttempts) {
      throw new Error('PostgreSQL (test) n\'est pas prêt après ' + maxAttempts + ' tentatives');
    }
    process.stdout.write(`  → Tentative ${attempt}/${maxAttempts}...\r`);
    await Bun.sleep(1000);
  }
}

async function waitForMinio(maxAttempts = 30): Promise<void> {
  logStep('4. Attente de MinIO');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await $`docker inspect --format "{{.State.Health.Status}}" ${MINIO_CONTAINER_NAME}`.quiet();
      const status = result.text().trim();
      if (status === 'healthy') {
        log('  ✓ MinIO est prêt!', 'green');
        return;
      }
    } catch {
      // Ignore l'erreur et réessaie
    }

    if (attempt === maxAttempts) {
      throw new Error('MinIO n\'est pas prêt après ' + maxAttempts + ' tentatives');
    }
    process.stdout.write(`  → Tentative ${attempt}/${maxAttempts}...\r`);
    await Bun.sleep(1000);
  }
}

async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await $`docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'evaluation_pdfs')"`.quiet();
    return parseInt(result.text().trim(), 10) === 2;
  } catch {
    return false;
  }
}

async function pushSchema(): Promise<void> {
  logStep('5. Vérification du schéma');

  if (await checkTablesExist()) {
    log('  ✓ Le schéma est déjà en place', 'green');
    return;
  }

  log('  → Push du schéma Drizzle...', 'yellow');
  await $`cd server && NODE_ENV=test bunx drizzle-kit push --force`.quiet();
  log('  ✓ Schéma poussé avec succès', 'green');
}

async function seedDatabase(): Promise<void> {
  logStep('6. Seed de la base de données test');

  log('  → Seeding de la base de données test...', 'yellow');
  await $`cd server && NODE_ENV=test bun run db:seed:test`.quiet();
  log('  ✓ Seed terminé avec succès', 'green');
}

async function runTests(): Promise<number> {
  logStep('7. Lancement des tests E2E');

  // Récupère les arguments supplémentaires passés au script
  const args = process.argv.slice(2);
  const argsStr = args.length > 0 ? ` ${args.join(' ')}` : '';

  log(`  → Exécution de Playwright...${argsStr ? ` (args:${argsStr})` : ''}`, 'blue');
  console.log('');

  // Lance Playwright avec les arguments supplémentaires
  const playwrightArgs = ['playwright', 'test', ...args];
  const proc = Bun.spawn(['bunx', ...playwrightArgs], {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: process.cwd(),
  });

  return await proc.exited;
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bold}   Aide-Prof - Tests E2E${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}`);

  try {
    await startPostgres();
    await waitForPostgres();
    await startMinio();
    await waitForMinio();
    await pushSchema();
    await seedDatabase();
    const exitCode = await runTests();
    process.exit(exitCode);
  } catch (error) {
    log(`\n✗ Erreur: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }
}

main();
