import type { SavedTag } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

/** Push saved tag; enqueue on failure/offline. */
export async function pushSavedTagSync(tag: SavedTag): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/saved-tags/${tag.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      }),
    dedupeKey: `saved-tag:${tag.id}`,
    entity: 'saved-tag',
    method: 'PUT',
    url: `/api/saved-tags/${tag.id}`,
    body: tag,
  });
}
