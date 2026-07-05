import { SavedTagSchema, type SavedTag } from '@codex/schemas';
import { getDatabase } from './db';

export const savedTagRepo = {
  async listByOwner(ownerId: string): Promise<SavedTag[]> {
    const tags = await getDatabase().savedTags.where('ownerId').equals(ownerId).sortBy('label');
    return tags;
  },

  async get(id: string): Promise<SavedTag | undefined> {
    return getDatabase().savedTags.get(id);
  },

  async save(tag: SavedTag): Promise<void> {
    const parsed = SavedTagSchema.parse(tag);
    await getDatabase().savedTags.put(parsed);
  },

  async delete(id: string): Promise<void> {
    await getDatabase().savedTags.delete(id);
  },
};
