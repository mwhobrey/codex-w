import { headers } from 'next/headers';
import { getAuth, isAuthConfigured } from './auth';

export async function getServerSession() {
  if (!isAuthConfigured()) return null;
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session?.user) {
    return null;
  }
  return session;
}
