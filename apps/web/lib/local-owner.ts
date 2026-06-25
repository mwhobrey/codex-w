const LOCAL_OWNER_KEY = 'codex-w-local-owner-id';

export function getLocalOwnerId(): string {
  if (typeof window === 'undefined') {
    return '00000000-0000-4000-8000-000000000000';
  }

  const existing = window.localStorage.getItem(LOCAL_OWNER_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(LOCAL_OWNER_KEY, id);
  return id;
}
