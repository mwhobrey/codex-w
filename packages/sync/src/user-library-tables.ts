import { UserLibraryTableSchema, type UserLibraryTable } from '@codex/schemas';
import { getDatabase } from './db';

export const userLibraryTableRepo = {
  async listByOwner(ownerId: string): Promise<UserLibraryTable[]> {
    const tables = await getDatabase()
      .userLibraryTables.where('ownerId')
      .equals(ownerId)
      .sortBy('updatedAt');
    return tables.map((table) => UserLibraryTableSchema.parse(table));
  },

  async get(id: string): Promise<UserLibraryTable | undefined> {
    const table = await getDatabase().userLibraryTables.get(id);
    return table ? UserLibraryTableSchema.parse(table) : undefined;
  },

  async save(table: UserLibraryTable): Promise<void> {
    const parsed = UserLibraryTableSchema.parse(table);
    await getDatabase().userLibraryTables.put(parsed);
  },

  async delete(id: string): Promise<void> {
    await getDatabase().userLibraryTables.delete(id);
  },
};
