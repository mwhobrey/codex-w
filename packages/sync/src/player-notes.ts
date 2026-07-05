import { PlayerNoteSchema, type PlayerNote } from '@codex/schemas';
import { getDatabase } from './db';

/**
 * Private per-player notes. Deliberately never touches the shared Yjs table
 * doc — local-first Dexie, optionally synced to the owning player's own
 * cloud account. No other player at the table can read these.
 */
export const playerNoteRepo = {
  async listByRoom(ownerId: string, roomId: string): Promise<PlayerNote[]> {
    const notes = await getDatabase()
      .playerNotes.where('[ownerId+roomId]')
      .equals([ownerId, roomId])
      .sortBy('createdAt');
    return notes;
  },

  async listByOwner(ownerId: string): Promise<PlayerNote[]> {
    return getDatabase().playerNotes.where('ownerId').equals(ownerId).sortBy('createdAt');
  },

  async append(note: PlayerNote): Promise<void> {
    await getDatabase().playerNotes.put(PlayerNoteSchema.parse(note));
  },

  async delete(id: string): Promise<void> {
    await getDatabase().playerNotes.delete(id);
  },
};
