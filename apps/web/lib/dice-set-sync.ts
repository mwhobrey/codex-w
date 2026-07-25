import type { DiceSet } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

/** Push dice set to cloud; enqueue on failure/offline. */
export async function pushDiceSetSync(set: DiceSet): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/dice-sets/${set.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(set),
      }),
    dedupeKey: `dice-set:${set.id}`,
    entity: 'dice-set',
    method: 'PUT',
    url: `/api/dice-sets/${set.id}`,
    body: set,
  });
}
