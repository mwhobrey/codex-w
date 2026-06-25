#!/usr/bin/env node
/**
 * Local dev bootstrap: start Docker Postgres (if available) and apply SQL migrations.
 * Safe to run repeatedly — migrations use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
 */
import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrateOnly = process.argv.includes('--migrate-only');

function tryExec(command) {
  try {
    return execSync(command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return null;
  }
}

function sleep(seconds) {
  execSync(`sleep ${seconds}`, { stdio: 'ignore' });
}

if (!tryExec('docker compose version')) {
  console.log('[codex] Docker not available — skipping local Postgres (offline / remote DB dev).');
  process.exit(0);
}

if (!migrateOnly) {
  console.log('[codex] Starting local Postgres…');
  try {
    execSync('docker compose up -d postgres', { cwd: root, stdio: 'inherit' });
  } catch {
    console.warn('[codex] Could not start Postgres — continuing without cloud sync.');
    process.exit(0);
  }
}

let ready = false;
for (let attempt = 0; attempt < 30; attempt += 1) {
  const status = tryExec('docker compose exec -T postgres pg_isready -U codex -d codex');
  if (status?.includes('accepting connections')) {
    ready = true;
    break;
  }
  sleep(1);
}

if (!ready) {
  console.warn('[codex] Postgres not ready — skipping migrations.');
  process.exit(0);
}

const drizzleDir = join(root, 'packages/db/drizzle');
const files = readdirSync(drizzleDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

for (const file of files) {
  const sql = readFileSync(join(drizzleDir, file), 'utf8');
  console.log(`[codex] migrate ${file}`);
  const result = spawnSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'codex',
      '-d',
      'codex',
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      '-',
    ],
    { cwd: root, input: sql, stdio: ['pipe', 'inherit', 'inherit'] },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[codex] Local Postgres ready.');
