import type { JournalEntry, SoloSession } from '@codex/schemas';

export async function queueSessionSync(session: SoloSession): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
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

export async function queueJournalSync(
  entry: JournalEntry,
  ownerId: string,
): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/sessions/${entry.sessionId}/journal`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry, ownerId }),
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
