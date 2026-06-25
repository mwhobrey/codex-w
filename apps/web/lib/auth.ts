import { account, getDb, isDatabaseConfigured, session, user, verification } from '@codex/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').map((s) => s.trim()),
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export function isAuthConfigured(): boolean {
  return (
    isDatabaseConfigured() &&
    Boolean(process.env.BETTER_AUTH_SECRET?.trim()) &&
    Boolean(process.env.BETTER_AUTH_URL?.trim())
  );
}

export function getAuth(): AuthInstance {
  if (!isAuthConfigured()) {
    throw new Error('Auth is not configured (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)');
  }
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}
