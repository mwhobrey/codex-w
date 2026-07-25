import type { JournalEntry, PlaySession } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

export async function pushSessionSync(session: PlaySession): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      }),
    dedupeKey: `session:${session.id}`,
    entity: 'session',
    method: 'PUT',
    url: `/api/sessions/${session.id}`,
    body: session,
  });
}

export async function pushJournalSync(
  entry: JournalEntry,
  ownerId: string,
): Promise<{ synced: boolean }> {
  const body = { entry, ownerId };
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/sessions/${entry.sessionId}/journal`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    dedupeKey: `journal:${entry.id}`,
    entity: 'journal',
    method: 'POST',
    url: `/api/sessions/${entry.sessionId}/journal`,
    body,
  });
}
