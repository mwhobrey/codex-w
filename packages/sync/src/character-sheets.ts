import { CharacterSheetSchema, type CharacterSheet } from '@codex/schemas';
import { getDatabase } from './db';

export const characterSheetRepo = {
  async list(): Promise<CharacterSheet[]> {
    return getDatabase().characterSheets.orderBy('updatedAt').reverse().toArray();
  },

  async listByOwner(ownerId: string): Promise<CharacterSheet[]> {
    const sheets = await getDatabase().characterSheets.where('ownerId').equals(ownerId).sortBy('updatedAt');
    return sheets.reverse();
  },

  async get(id: string): Promise<CharacterSheet | undefined> {
    return getDatabase().characterSheets.get(id);
  },

  async save(sheet: CharacterSheet): Promise<void> {
    const parsed = CharacterSheetSchema.parse(sheet);
    await getDatabase().characterSheets.put(parsed);
  },

  async delete(id: string): Promise<void> {
    await getDatabase().characterSheets.delete(id);
  },
};
