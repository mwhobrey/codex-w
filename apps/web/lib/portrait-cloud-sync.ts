import { characterPortraitRepo, characterSheetRepo } from '@codex/sync';
import type { CharacterSheet } from '@codex/schemas';

interface AssetUploadStatus {
  configured: boolean;
  signedIn: boolean;
  canUpload: boolean;
}

async function fetchAssetUploadStatus(): Promise<AssetUploadStatus> {
  try {
    const response = await fetch('/api/assets/status', { credentials: 'include' });
    if (!response.ok) {
      return { configured: false, signedIn: false, canUpload: false };
    }
    return response.json() as Promise<AssetUploadStatus>;
  } catch {
    return { configured: false, signedIn: false, canUpload: false };
  }
}

/** Upload a portrait file to object storage when cloud auth + S3 are available. */
export async function uploadPortraitFile(file: File): Promise<string | undefined> {
  const status = await fetchAssetUploadStatus();
  if (!status.canUpload) return undefined;

  const formData = new FormData();
  formData.set('file', file);
  const response = await fetch('/api/assets', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? 'Portrait upload failed');
  }
  return payload.url;
}

/**
 * If the sheet has a local-only portrait, upload it and return an updated sheet with portraitUrl.
 * No-op when cloud upload is unavailable or portraitUrl is already set.
 */
export async function ensureSheetPortraitSynced(sheet: CharacterSheet): Promise<CharacterSheet> {
  if (sheet.portraitUrl?.trim()) return sheet;

  const file = await characterPortraitRepo.getFile(sheet.id);
  if (!file) return sheet;

  const url = await uploadPortraitFile(file);
  if (!url) return sheet;

  return {
    ...sheet,
    portraitUrl: url,
    updatedAt: new Date().toISOString(),
  };
}

/** Push any local-only portraits to object storage, persist portraitUrl, and sync sheets. */
export async function syncPendingPortraitUploads(ownerId: string): Promise<void> {
  const sheets = await characterSheetRepo.listByOwner(ownerId);
  const { queueSheetSync } = await import('./sheet-sync');

  for (const sheet of sheets) {
    const next = await ensureSheetPortraitSynced(sheet);
    if (!next.portraitUrl || next.portraitUrl === sheet.portraitUrl) continue;
    await characterSheetRepo.save(next);
    void queueSheetSync(next);
  }
}
