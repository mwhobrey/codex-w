import type { DiceRollHistoryEntry } from './db';
import { getDatabase } from './db';

const MAX_HISTORY_PER_OWNER = 50;

export const diceRollHistoryRepo = {
  async listByOwner(ownerId: string): Promise<DiceRollHistoryEntry[]> {
    const entries = await getDatabase()
      .diceRollHistory.where('ownerId')
      .equals(ownerId)
      .sortBy('rolledAt');
    return entries.reverse();
  },

  async append(entry: DiceRollHistoryEntry): Promise<void> {
    const db = getDatabase();
    await db.diceRollHistory.put(entry);

    const all = await db.diceRollHistory.where('ownerId').equals(entry.ownerId).sortBy('rolledAt');
    if (all.length > MAX_HISTORY_PER_OWNER) {
      const excess = all.slice(0, all.length - MAX_HISTORY_PER_OWNER);
      await db.diceRollHistory.bulkDelete(excess.map((e) => e.rolledAt));
    }
  },

  async clear(ownerId: string): Promise<void> {
    await getDatabase().diceRollHistory.where('ownerId').equals(ownerId).delete();
  },
};
