import type { PlayerNote } from '@codex/schemas';

/** Push a private note to the owning player's own cloud account, if signed in. */
export async function queuePlayerNoteSync(note: PlayerNote): Promise<{ synced: boolean }> {
  try {
    const res = await fetch('/api/player-notes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });

    if (res.status === 401 || res.status === 503) {
      return { synced: false };
    }

    if (!res.ok) {
      return { synced: false };
    }

    const data = (await res.json()) as { synced?: boolean };
    return { synced: data.synced === true };
  } catch {
    return { synced: false };
  }
}
