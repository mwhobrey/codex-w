import { getDatabase } from './db';

export interface CharacterPortraitRecord {
  characterId: string;
  blob: Blob;
  mimeType: string;
  updatedAt: string;
}

const objectUrlCache = new Map<string, string>();

function revokeCachedUrl(characterId: string) {
  const existing = objectUrlCache.get(characterId);
  if (existing) {
    URL.revokeObjectURL(existing);
    objectUrlCache.delete(characterId);
  }
}

export const characterPortraitRepo = {
  async save(characterId: string, file: File): Promise<void> {
    revokeCachedUrl(characterId);
    const record: CharacterPortraitRecord = {
      characterId,
      blob: file,
      mimeType: file.type || 'application/octet-stream',
      updatedAt: new Date().toISOString(),
    };
    await getDatabase().characterPortraits.put(record);
  },

  async get(characterId: string): Promise<CharacterPortraitRecord | undefined> {
    return getDatabase().characterPortraits.get(characterId);
  },

  async getFile(characterId: string): Promise<File | undefined> {
    const record = await this.get(characterId);
    if (!record) return undefined;
    return new File([record.blob], `${characterId}-portrait`, { type: record.mimeType });
  },

  async getObjectUrl(characterId: string): Promise<string | undefined> {
    const cached = objectUrlCache.get(characterId);
    if (cached) return cached;

    const record = await this.get(characterId);
    if (!record) return undefined;

    const url = URL.createObjectURL(record.blob);
    objectUrlCache.set(characterId, url);
    return url;
  },

  async delete(characterId: string): Promise<void> {
    revokeCachedUrl(characterId);
    await getDatabase().characterPortraits.delete(characterId);
  },

  /** Test helper — clears in-memory object URL cache */
  clearObjectUrlCacheForTests(): void {
    for (const url of objectUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    objectUrlCache.clear();
  },
};
