import {
  JournalEntrySchema,
  SoloSessionSchema,
  type GameSystemId,
  type JournalEntry,
  type SoloSession,
} from '@codex/schemas';
import { getDatabase } from './db';

export const soloSessionRepo = {
  async listByOwner(ownerId: string): Promise<SoloSession[]> {
    const sessions = await getDatabase().soloSessions.where('ownerId').equals(ownerId).sortBy('updatedAt');
    return sessions.reverse();
  },

  async listByOwnerAndSystem(ownerId: string, gameSystemId: GameSystemId): Promise<SoloSession[]> {
    const sessions = await getDatabase()
      .soloSessions.where('ownerId')
      .equals(ownerId)
      .filter((session) => session.gameSystemId === gameSystemId)
      .sortBy('updatedAt');
    return sessions.reverse();
  },

  async get(id: string): Promise<SoloSession | undefined> {
    return getDatabase().soloSessions.get(id);
  },

  async save(session: SoloSession): Promise<void> {
    await getDatabase().soloSessions.put(SoloSessionSchema.parse(session));
  },

  async delete(id: string): Promise<void> {
    await getDatabase().soloSessions.delete(id);
    await getDatabase().journalEntries.where('sessionId').equals(id).delete();
  },
};

export const journalRepo = {
  async listBySession(sessionId: string): Promise<JournalEntry[]> {
    return getDatabase().journalEntries.where('sessionId').equals(sessionId).sortBy('createdAt');
  },

  async append(entry: JournalEntry): Promise<void> {
    await getDatabase().journalEntries.put(JournalEntrySchema.parse(entry));
  },

  async exportMarkdown(sessionId: string): Promise<string> {
    const entries = await journalRepo.listBySession(sessionId);
    const lines = ['# Solo Session Journal', ''];
    for (const entry of entries) {
      const time = new Date(entry.createdAt).toLocaleString();
      lines.push(`## ${entry.type.toUpperCase()} · ${time}`);
      lines.push('');
      lines.push(entry.content);
      lines.push('');
    }
    return lines.join('\n');
  },
};
