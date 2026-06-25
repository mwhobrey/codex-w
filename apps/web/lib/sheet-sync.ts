import type { CharacterSheet } from '@codex/schemas';

/** Push sheet to cloud when signed in and cloud is configured. */
export async function queueSheetSync(sheet: CharacterSheet): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/sheets/${sheet.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheet),
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
