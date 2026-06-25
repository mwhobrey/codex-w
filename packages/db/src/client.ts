import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof createNeonDb> | ReturnType<typeof createPostgresDb>;

let dbInstance: DrizzleDb | null = null;

function isLocalDatabaseUrl(url: string): boolean {
  if (process.env.DATABASE_DRIVER === 'postgres') return true;
  if (process.env.DATABASE_DRIVER === 'neon') return false;
  try {
    const host = new URL(url.replace(/^postgres:/, 'http:')).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

function createNeonDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzleNeon(sql, { schema });
}

function createPostgresDb(connectionString: string) {
  const client = postgres(connectionString, { max: 10 });
  return drizzlePostgres(client, { schema });
}

function createDb(connectionString: string): DrizzleDb {
  return isLocalDatabaseUrl(connectionString)
    ? createPostgresDb(connectionString)
    : createNeonDb(connectionString);
}

export type CodexDb = DrizzleDb;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb(): CodexDb {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  if (!dbInstance) {
    dbInstance = createDb(url);
  }
  return dbInstance;
}
