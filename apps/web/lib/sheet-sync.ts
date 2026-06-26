import { characterSheetRepo, isCharacterSheetDeleted } from '@codex/sync';
import type { CharacterSheet } from '@codex/schemas';
import { ensureSheetPortraitSynced } from '@/lib/portrait-cloud-sync';

/** Push sheet to cloud when signed in and cloud is configured. */
export async function queueSheetSync(sheet: CharacterSheet): Promise<{ synced: boolean }> {
  if (isCharacterSheetDeleted(sheet.id)) {
    return { synced: false };
  }
  let toSync = sheet;
  try {
    toSync = await ensureSheetPortraitSynced(sheet);
    if (toSync.portraitUrl !== sheet.portraitUrl) {
      await characterSheetRepo.save(toSync);
    }
  } catch {
    toSync = sheet;
  }

  try {
    const res = await fetch(`/api/sheets/${toSync.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSync),
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

/** Remove sheet from cloud when signed in. Local tombstone is written by characterSheetRepo.delete. */
export async function queueSheetDelete(sheetId: string): Promise<{ synced: boolean }> {
  try {
    const res = await fetch(`/api/sheets/${sheetId}`, {
      method: 'DELETE',
      credentials: 'include',
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
