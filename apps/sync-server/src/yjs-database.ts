import { Database } from '@hocuspocus/extension-database';
import {
  fetchYjsDocument,
  getDb,
  isDatabaseConfigured,
  storeYjsDocument,
  toYjsStateBytes,
} from '@codex/db';

/**
 * Persist Yjs docs (public rooms + fog-secrets) when DATABASE_URL is set.
 * Returns null when cloud DB is not configured so Hocuspocus stays memory-only.
 */
export function createYjsDatabaseExtension(): Database | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return new Database({
    fetch: async ({ documentName }) => {
      try {
        return await fetchYjsDocument(getDb(), documentName);
      } catch (error) {
        console.error(`[sync-server] fetch Yjs "${documentName}" failed`, error);
        return null;
      }
    },
    store: async ({ documentName, state }) => {
      try {
        const bytes = toYjsStateBytes(state);
        if (!bytes) return;
        await storeYjsDocument(getDb(), documentName, bytes);
      } catch (error) {
        console.error(`[sync-server] store Yjs "${documentName}" failed`, error);
      }
    },
  });
}
