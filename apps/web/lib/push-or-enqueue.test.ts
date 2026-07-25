import { beforeEach, describe, expect, it, vi } from 'vitest';

const enqueueCloudMutation = vi.fn(async () => ({ id: 'mut-1' }));

vi.mock('@codex/sync', () => ({
  enqueueCloudMutation: (...args: unknown[]) => enqueueCloudMutation(...args),
}));

import { pushOrEnqueue } from './push-or-enqueue';

describe('pushOrEnqueue', () => {
  beforeEach(() => {
    enqueueCloudMutation.mockClear();
  });

  it('returns synced without enqueue when PUT reports synced', async () => {
    const result = await pushOrEnqueue({
      request: async () =>
        new Response(JSON.stringify({ synced: true }), { status: 200 }),
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a' },
    });

    expect(result).toEqual({ synced: true });
    expect(enqueueCloudMutation).not.toHaveBeenCalled();
  });

  it('enqueues when the request throws', async () => {
    const result = await pushOrEnqueue({
      request: async () => {
        throw new TypeError('Failed to fetch');
      },
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a' },
    });

    expect(result).toEqual({ synced: false });
    expect(enqueueCloudMutation).toHaveBeenCalledWith({
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a' },
    });
  });

  it('enqueues when PUT is ok but synced is false', async () => {
    const result = await pushOrEnqueue({
      request: async () =>
        new Response(JSON.stringify({ synced: false }), { status: 200 }),
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a' },
    });

    expect(result).toEqual({ synced: false });
    expect(enqueueCloudMutation).toHaveBeenCalledOnce();
  });

  it('enqueues on non-OK responses', async () => {
    const result = await pushOrEnqueue({
      request: async () => new Response('nope', { status: 503 }),
      dedupeKey: 'sheet:a',
      entity: 'sheet',
      method: 'PUT',
      url: '/api/sheets/a',
      body: { id: 'a' },
    });

    expect(result).toEqual({ synced: false });
    expect(enqueueCloudMutation).toHaveBeenCalledOnce();
  });

  it('treats DELETE OK without JSON body as synced', async () => {
    const result = await pushOrEnqueue({
      request: async () => new Response('', { status: 200 }),
      dedupeKey: 'sheet-delete:a',
      entity: 'sheet-delete',
      method: 'DELETE',
      url: '/api/sheets/a',
    });

    expect(result).toEqual({ synced: true });
    expect(enqueueCloudMutation).not.toHaveBeenCalled();
  });

  it('enqueues DELETE when body says synced false', async () => {
    const result = await pushOrEnqueue({
      request: async () =>
        new Response(JSON.stringify({ synced: false }), { status: 200 }),
      dedupeKey: 'sheet-delete:a',
      entity: 'sheet-delete',
      method: 'DELETE',
      url: '/api/sheets/a',
    });

    expect(result).toEqual({ synced: false });
    expect(enqueueCloudMutation).toHaveBeenCalledOnce();
  });
});
