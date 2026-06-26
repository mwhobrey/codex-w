import type { UserLibraryTable } from '@codex/schemas';

/** Push library table to cloud when signed in and cloud is configured. */
export async function queueLibraryTableSync(table: UserLibraryTable): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/library-tables/${table.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table),
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
