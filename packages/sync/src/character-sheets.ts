import { CharacterSheetSchema, type CharacterSheet } from '@codex/schemas';
import { getDatabase } from './db';

const DELETED_SHEETS_STORAGE_KEY = 'codex-deleted-character-sheet-ids';

function readDeletedSheetIds(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_SHEETS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function writeDeletedSheetIds(ids: Set<string>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DELETED_SHEETS_STORAGE_KEY, JSON.stringify([...ids]));
}

/** Tombstone — prevents cloud pull from resurrecting a user-deleted sheet. */
export function isCharacterSheetDeleted(id: string): boolean {
  return readDeletedSheetIds().has(id);
}

function markCharacterSheetDeleted(id: string): void {
  const ids = readDeletedSheetIds();
  ids.add(id);
  writeDeletedSheetIds(ids);
}

export const characterSheetRepo = {
  async list(): Promise<CharacterSheet[]> {
    const deleted = readDeletedSheetIds();
    const sheets = await getDatabase().characterSheets.orderBy('updatedAt').reverse().toArray();
    return deleted.size === 0 ? sheets : sheets.filter((sheet) => !deleted.has(sheet.id));
  },

  async listByOwner(ownerId: string): Promise<CharacterSheet[]> {
    const deleted = readDeletedSheetIds();
    const sheets = await getDatabase()
      .characterSheets.where('ownerId')
      .equals(ownerId)
      .sortBy('updatedAt');
    const visible = sheets.reverse();
    return deleted.size === 0 ? visible : visible.filter((sheet) => !deleted.has(sheet.id));
  },

  async get(id: string): Promise<CharacterSheet | undefined> {
    if (isCharacterSheetDeleted(id)) return undefined;
    return getDatabase().characterSheets.get(id);
  },

  async save(sheet: CharacterSheet): Promise<void> {
    const parsed = CharacterSheetSchema.parse(sheet);
    await getDatabase().characterSheets.put(parsed);
  },

  async delete(id: string): Promise<void> {
    markCharacterSheetDeleted(id);
    await getDatabase().characterSheets.delete(id);
  },
};
