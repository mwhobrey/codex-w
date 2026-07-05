#!/usr/bin/env node
/**
 * Build-time migration runner for Vercel (and anywhere else with a real
 * DATABASE_URL). Applies every SQL file in drizzle/ in order using a direct
 * Postgres connection — works against Neon or local Postgres alike, no CLI
 * tools required.
 *
 * Every migration here is written to be safe to replay (IF NOT EXISTS /
 * ADD COLUMN IF NOT EXISTS / guarded renames), so this just re-applies the
 * full set each run rather than tracking what's already landed. Skips
 * quietly if DATABASE_URL isn't set (CI builds, contributors without a DB).
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const drizzleDir = join(root, 'drizzle');

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.log('[migrate] DATABASE_URL not set — skipping migrations.');
  process.exit(0);
}

const files = readdirSync(drizzleDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();

// Migrations lean on IF NOT EXISTS / ADD COLUMN IF NOT EXISTS, so replays
// throw a NOTICE per already-applied statement — expected noise, not errors.
const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10, onnotice: () => {} });

try {
  for (const file of files) {
    console.log(`[migrate] applying ${file}`);
    await sql.file(join(drizzleDir, file));
  }
  console.log(`[migrate] done — ${files.length} file(s) applied.`);
} catch (error) {
  console.error('[migrate] failed:', error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
