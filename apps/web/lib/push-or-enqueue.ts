import { enqueueCloudMutation, type CloudMutationEntity } from '@codex/sync';

/** Shared best-effort push: return synced, else enqueue for durable retry. */
export async function pushOrEnqueue(options: {
  request: () => Promise<Response>;
  dedupeKey: string;
  entity: CloudMutationEntity;
  method: 'PUT' | 'POST' | 'DELETE';
  url: string;
  body?: unknown;
}): Promise<{ synced: boolean }> {
  try {
    const res = await options.request();
    if (res.ok) {
      if (options.method === 'DELETE') {
        try {
          const data = (await res.json()) as { synced?: boolean };
          if (data.synced === false) {
            // fall through to enqueue
          } else {
            return { synced: true };
          }
        } catch {
          return { synced: true };
        }
      } else {
        const data = (await res.json()) as { synced?: boolean };
        if (data.synced === true) return { synced: true };
      }
    }
  } catch {
    // fall through to enqueue
  }

  await enqueueCloudMutation({
    dedupeKey: options.dedupeKey,
    entity: options.entity,
    method: options.method,
    url: options.url,
    body: options.body,
  });
  return { synced: false };
}
