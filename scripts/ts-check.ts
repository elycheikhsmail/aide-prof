#!/usr/bin/env bun
/**
 * Script de vérification TypeScript pour le frontend et le backend
 *
 * Ce script :
 * 1. Vérifie les types TypeScript dans le frontend (frontend/)
 * 2. Vérifie les types TypeScript dans le backend (server/src/)
 * 3. Affiche un résumé des résultats
 */

import { $ } from 'bun';

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

interface CheckResult {
  name: string;
  success: boolean;
  output: string;
}

async function checkFrontend(): Promise<CheckResult> {
  logStep('1. Vérification TypeScript - Frontend');
  log('  → Vérification de frontend/...', 'yellow');

  try {
    const result = await $`bunx tsc --project tsconfig.app.json --noEmit`.quiet();
    log('  ✓ Frontend: aucune erreur TypeScript', 'green');
    return { name: 'Frontend', success: true, output: result.text() };
  } catch (error) {
    const output = error instanceof Error && 'stdout' in error
      ? String((error as { stdout: unknown }).stdout)
      : String(error);
    log('  ✗ Frontend: erreurs TypeScript détectées', 'red');
    console.log(output);
    return { name: 'Frontend', success: false, output };
  }
}

async function checkBackend(): Promise<CheckResult> {
  logStep('2. Vérification TypeScript - Backend');
  log('  → Vérification de server/src/...', 'yellow');

  try {
    const result = await $`cd server && bunx tsc --noEmit`.quiet();
    log('  ✓ Backend: aucune erreur TypeScript', 'green');
    return { name: 'Backend', success: true, output: result.text() };
  } catch (error) {
    const output = error instanceof Error && 'stdout' in error
      ? String((error as { stdout: unknown }).stdout)
      : String(error);
    log('  ✗ Backend: erreurs TypeScript détectées', 'red');
    console.log(output);
    return { name: 'Backend', success: false, output };
  }
}

async function main() {
  console.log(`\n${colors.bold}${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.bold}   Aide-Prof - Vérification TypeScript${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}========================================${colors.reset}`);

  const results: CheckResult[] = [];

  // Vérification du frontend
  results.push(await checkFrontend());

  // Vérification du backend
  results.push(await checkBackend());

  // Résumé
  logStep('Résumé');
  const allPassed = results.every(r => r.success);

  for (const result of results) {
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? 'green' : 'red';
    log(`  ${icon} ${result.name}`, color);
  }

  console.log('');

  if (allPassed) {
    log('✓ Toutes les vérifications TypeScript ont réussi!', 'green');
    process.exit(0);
  } else {
    log('✗ Des erreurs TypeScript ont été détectées.', 'red');
    process.exit(1);
  }
}

main();
