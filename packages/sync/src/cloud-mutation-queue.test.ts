import { describe, expect, it, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import {
  cloudMutationBackoffMs,
  enqueueCloudMutation,
  flushCloudQueue,
  listCloudMutationQueue,
} from './cloud-mutation-queue';
import { deleteDatabaseForTests, getDatabase } from './db';

describe('cloud mutation queue', () => {
  beforeEach(async () => {
    await deleteDatabaseForTests();
    getDatabase();
  });

  it('computes exponential backoff capped at 5 minutes', () => {
    expect(cloudMutationBackoffMs(1)).toBe(2_000);
    expect(cloudMutationBackoffMs(2)).toBe(4_000);
    expect(cloudMutationBackoffMs(10)).toBe(5 * 60_000);
  });

  it('dedupes by key keeping latest body', async () => {
    await enqueueCloudMutation({
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a', name: 'one' },
    });
    await enqueueCloudMutation({
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a', name: 'two' },
    });
    const rows = await listCloudMutationQueue();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.body).toEqual({ id: 'a', name: 'two' });
  });

  it('acks successful mutations and retries failures', async () => {
    await enqueueCloudMutation({
      dedupeKey: 'sheet:ok',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/ok',
      body: { id: 'ok' },
    });
    await enqueueCloudMutation({
      dedupeKey: 'sheet:fail',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/fail',
      body: { id: 'fail' },
    });

    const fetchImpl = vi.fn(async (input: string | URL) => {
      if (String(input).includes('fail')) {
        return new Response(JSON.stringify({ error: 'nope' }), { status: 500 });
      }
      return new Response(JSON.stringify({ synced: true }), { status: 200 });
    }) as unknown as typeof fetch;

    const result = await flushCloudQueue({ fetchImpl, now: Date.now() });
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);

    const remaining = await listCloudMutationQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.dedupeKey).toBe('sheet:fail');
    expect(remaining[0]?.attempts).toBe(1);
  });
});
