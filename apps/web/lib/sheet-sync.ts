import { characterSheetRepo, isCharacterSheetDeleted } from '@codex/sync';
import type { CharacterSheet } from '@codex/schemas';
import { ensureSheetPortraitSynced } from '@/lib/portrait-cloud-sync';
import { pushOrEnqueue } from '@/lib/push-or-enqueue';

/** Push sheet to cloud; enqueue for retry when offline/failed. */
export async function pushSheetSync(sheet: CharacterSheet): Promise<{ synced: boolean }> {
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

  return pushOrEnqueue({
    request: () =>
      fetch(`/api/sheets/${toSync.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSync),
      }),
    dedupeKey: `sheet:${toSync.id}`,
    entity: 'sheet',
    method: 'PUT',
    url: `/api/sheets/${toSync.id}`,
    body: toSync,
  });
}

/** Remove sheet from cloud; enqueue delete if push fails. */
export async function pushSheetDelete(sheetId: string): Promise<{ synced: boolean }> {
  return pushOrEnqueue({
    request: () =>
      fetch(`/api/sheets/${sheetId}`, {
        method: 'DELETE',
        credentials: 'include',
      }),
    dedupeKey: `sheet-delete:${sheetId}`,
    entity: 'sheet-delete',
    method: 'DELETE',
    url: `/api/sheets/${sheetId}`,
  });
}
