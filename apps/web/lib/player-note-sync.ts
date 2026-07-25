import type { PlayerNote } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

/** Push a private note; enqueue on failure/offline. */
export async function pushPlayerNoteSync(note: PlayerNote): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch('/api/player-notes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      }),
    dedupeKey: `player-note:${note.id}`,
    entity: 'player-note',
    method: 'POST',
    url: '/api/player-notes',
    body: note,
  });
}
