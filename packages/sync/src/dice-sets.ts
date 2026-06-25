import { DiceSetSchema, type DiceSet } from '@codex/schemas';
import { getDatabase } from './db';

export const diceSetRepo = {
  async listByOwner(ownerId: string): Promise<DiceSet[]> {
    const sets = await getDatabase().diceSets.where('ownerId').equals(ownerId).sortBy('updatedAt');
    return sets.reverse();
  },

  async get(id: string): Promise<DiceSet | undefined> {
    return getDatabase().diceSets.get(id);
  },

  async save(set: DiceSet): Promise<void> {
    const parsed = DiceSetSchema.parse(set);
    await getDatabase().diceSets.put(parsed);
  },

  async delete(id: string): Promise<void> {
    await getDatabase().diceSets.delete(id);
  },
};
