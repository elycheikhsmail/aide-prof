#!/usr/bin/env bun
/**
 * Script de démarrage intelligent pour le développement
 *
 * Ce script :
 * 1. Démarre PostgreSQL via Docker si pas déjà lancé
 * 2. Attend que PostgreSQL soit prêt
 * 3. Push le schéma Drizzle si les tables n'existent pas
 * 4. Seed la DB si pas de données
 * 5. Lance le backend et le frontend en parallèle
 */

import { $ } from 'bun';

const CONTAINER_NAME = 'aide-prof-db';
const DB_USER = 'aideprof';
const DB_NAME = 'aideprof';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: string) {
  console.log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset}`);
}

async function isContainerRunning(): Promise<boolean> {
  try {
    const result = await $`docker ps --filter "name=${CONTAINER_NAME}" --filter "status=running" --format "{{.Names}}"`.quiet();
    return result.text().trim() === CONTAINER_NAME;
  } catch {
    return false;
  }
}

async function startPostgres(): Promise<void> {
  logStep('1. Vérification de PostgreSQL');

  if (await isContainerRunning()) {
    log('  ✓ PostgreSQL est déjà en cours d\'exécution', 'green');
    return;
  }

  log('  → Démarrage de PostgreSQL via Docker...', 'yellow');
  await $`docker compose up -d postgres`.quiet();
  log('  ✓ Container démarré', 'green');
}

async function waitForPostgres(maxAttempts = 30): Promise<void> {
  logStep('2. Attente de PostgreSQL');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await $`docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME}`.quiet();
      if (result.exitCode === 0) {
        log('  ✓ PostgreSQL est prêt!', 'green');
        return;
      }
    } catch {
      // Ignore l'erreur et réessaie
    }

    if (attempt === maxAttempts) {
      throw new Error('PostgreSQL n\'est pas prêt après ' + maxAttempts + ' tentatives');
    }
    process.stdout.write(`  → Tentative ${attempt}/${maxAttempts}...\r`);
    await Bun.sleep(1000);
  }
}

async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await $`docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"`.quiet();
    return result.text().trim() === 't';
  } catch {
    return false;
  }
}

async function pushSchema(): Promise<void> {
  logStep('3. Vérification du schéma');

  if (await checkTablesExist()) {
    log('  ✓ Le schéma est déjà en place', 'green');
    return;
  }

  log('  → Push du schéma Drizzle...', 'yellow');
  await $`cd server && bun run db:push`.quiet();
  log('  ✓ Schéma poussé avec succès', 'green');
}

async function checkDataExists(): Promise<boolean> {
  try {
    const result = await $`docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -tAc "SELECT COUNT(*) FROM users"`.quiet();
    const count = parseInt(result.text().trim(), 10);
    return count > 0;
  } catch {
    return false;
  }
}

async function seedDatabase(): Promise<void> {
  logStep('4. Vérification des données');

  if (await checkDataExists()) {
    log('  ✓ La base de données est déjà seedée', 'green');
    return;
  }

  log('  → Seeding de la base de données...', 'yellow');
  await $`cd server && bun run db:seed`.quiet();
  log('  ✓ Seed terminé avec succès', 'green');
}

async function startServers(): Promise<void> {
  logStep('5. Démarrage des serveurs');

  log('  → Lancement du backend (http://localhost:3000) et du frontend (http://localhost:5173)...', 'blue');
  console.log('');

  // Lance les deux serveurs en parallèle avec concurrently
  const proc = Bun.spawn(['bunx', 'concurrently', '-n', 'frontend,backend', '-c', 'cyan,magenta', 'bun run dev:frontend', 'bun run dev:backend'], {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: process.cwd(),
  });

  await proc.exited;
}

async function main() {
  console.log(`\n${colors.bold}${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.bold}   Aide-Prof - Démarrage Développement${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}========================================${colors.reset}`);

  try {
    await startPostgres();
    await waitForPostgres();
    await pushSchema();
    await seedDatabase();
    await startServers();
  } catch (error) {
    log(`\n✗ Erreur: ${error instanceof Error ? error.message : String(error)}`, 'red');
    process.exit(1);
  }
}

main();
