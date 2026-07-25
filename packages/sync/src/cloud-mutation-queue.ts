import { getDatabase, type CloudMutationEntity, type CloudMutationRecord } from './db';

const MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MS = 2_000;

export interface EnqueueCloudMutationInput {
  dedupeKey: string;
  entity: CloudMutationEntity;
  method: 'PUT' | 'POST' | 'DELETE';
  url: string;
  body?: unknown;
}

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cloudMutationBackoffMs(attempts: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), 5 * 60_000);
}

/** Enqueue (or replace) a pending cloud mutation. */
export async function enqueueCloudMutation(
  input: EnqueueCloudMutationInput,
): Promise<CloudMutationRecord> {
  const db = getDatabase();
  const existing = await db.cloudMutationQueue.where('dedupeKey').equals(input.dedupeKey).first();
  const now = Date.now();
  const record: CloudMutationRecord = {
    id: existing?.id ?? createId(),
    dedupeKey: input.dedupeKey,
    entity: input.entity,
    method: input.method,
    url: input.url,
    body: input.body,
    attempts: existing?.attempts ?? 0,
    nextAttemptAt: now,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await db.cloudMutationQueue.put(record);
  return record;
}

export interface FlushCloudQueueOptions {
  /** Injected for tests; defaults to global fetch with credentials. */
  fetchImpl?: typeof fetch;
  now?: number;
}

export interface FlushCloudQueueResult {
  attempted: number;
  succeeded: number;
  failed: number;
  dropped: number;
  /** True when a 401 stopped the flush (caller should wait for auth). */
  stoppedUnauthorized: boolean;
}

/**
 * Flush due mutations. Call after sign-in pull and on `online`.
 * Removes on 2xx; backs off on network/5xx; drops after MAX_ATTEMPTS.
 */
export async function flushCloudQueue(
  options: FlushCloudQueueOptions = {},
): Promise<FlushCloudQueueResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now();
  const db = getDatabase();
  const due = (
    await db.cloudMutationQueue.where('nextAttemptAt').belowOrEqual(now).toArray()
  ).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let succeeded = 0;
  let failed = 0;
  let dropped = 0;
  let stoppedUnauthorized = false;

  for (const mutation of due) {
    if (stoppedUnauthorized) break;

    try {
      const res = await fetchImpl(mutation.url, {
        method: mutation.method,
        credentials: 'include',
        headers:
          mutation.body !== undefined
            ? { 'Content-Type': 'application/json' }
            : undefined,
        body: mutation.body !== undefined ? JSON.stringify(mutation.body) : undefined,
      });

      if (res.status === 401) {
        stoppedUnauthorized = true;
        break;
      }

      if (res.ok) {
        await db.cloudMutationQueue.delete(mutation.id);
        succeeded += 1;
        continue;
      }

      // 503 / 4xx other than 401 — retry with backoff
      const attempts = mutation.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await db.cloudMutationQueue.delete(mutation.id);
        dropped += 1;
      } else {
        await db.cloudMutationQueue.put({
          ...mutation,
          attempts,
          nextAttemptAt: now + cloudMutationBackoffMs(attempts),
        });
        failed += 1;
      }
    } catch {
      const attempts = mutation.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await db.cloudMutationQueue.delete(mutation.id);
        dropped += 1;
      } else {
        await db.cloudMutationQueue.put({
          ...mutation,
          attempts,
          nextAttemptAt: now + cloudMutationBackoffMs(attempts),
        });
        failed += 1;
      }
    }
  }

  return {
    attempted: due.length,
    succeeded,
    failed,
    dropped,
    stoppedUnauthorized,
  };
}

export async function listCloudMutationQueue(): Promise<CloudMutationRecord[]> {
  return (await getDatabase().cloudMutationQueue.toArray()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}
