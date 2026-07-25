import type { UserLibraryTable } from '@codex/schemas';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

/** Push library table to cloud; enqueue on failure/offline. */
export async function pushLibraryTableSync(table: UserLibraryTable): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/library-tables/${table.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
      }),
    dedupeKey: `library-table:${table.id}`,
    entity: 'library-table',
    method: 'PUT',
    url: `/api/library-tables/${table.id}`,
    body: table,
  });
}
