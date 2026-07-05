import {
  JournalEntrySchema,
  PlaySessionSchema,
  type GameSystemId,
  type JournalEntry,
  type PlaySession,
} from '@codex/schemas';
import { getDatabase } from './db';

export const playSessionRepo = {
  async listByOwner(ownerId: string): Promise<PlaySession[]> {
    const sessions = await getDatabase().playSessions.where('ownerId').equals(ownerId).sortBy('updatedAt');
    return sessions.reverse();
  },

  async listByOwnerAndSystem(ownerId: string, gameSystemId: GameSystemId): Promise<PlaySession[]> {
    const sessions = await getDatabase()
      .playSessions.where('ownerId')
      .equals(ownerId)
      .filter((session) => session.gameSystemId === gameSystemId)
      .sortBy('updatedAt');
    return sessions.reverse();
  },

  async listByRoom(ownerId: string, roomId: string): Promise<PlaySession[]> {
    const sessions = await getDatabase()
      .playSessions.where('ownerId')
      .equals(ownerId)
      .filter((session) => session.roomId === roomId)
      .sortBy('chapterNumber');
    return sessions;
  },

  async get(id: string): Promise<PlaySession | undefined> {
    return getDatabase().playSessions.get(id);
  },

  async save(session: PlaySession): Promise<void> {
    await getDatabase().playSessions.put(PlaySessionSchema.parse(session));
  },

  async delete(id: string): Promise<void> {
    await getDatabase().playSessions.delete(id);
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

  async searchByOwner(
    ownerId: string,
    options: { tag?: string; type?: JournalEntry['type']; text?: string } = {},
  ): Promise<JournalEntry[]> {
    const sessions = await playSessionRepo.listByOwner(ownerId);
    const sessionIds = new Set(sessions.map((session) => session.id));
    const all = await getDatabase().journalEntries.toArray();
    return all.filter((entry) => {
      if (!sessionIds.has(entry.sessionId)) return false;
      if (options.type && entry.type !== options.type) return false;
      if (options.tag && !entry.tags?.includes(options.tag)) return false;
      if (options.text && !entry.content.toLowerCase().includes(options.text.toLowerCase())) return false;
      return true;
    });
  },

  /** Most recent past-chapter entry tagged `tag` at this room, for the "last mentioned" callback. */
  async findLastMentionInRoom(
    ownerId: string,
    roomId: string,
    tag: string,
  ): Promise<{ entry: JournalEntry; chapterNumber?: number } | null> {
    const sessions = await playSessionRepo.listByRoom(ownerId, roomId);
    let best: { entry: JournalEntry; chapterNumber?: number } | null = null;
    for (const session of sessions) {
      const entries = await journalRepo.listBySession(session.id);
      for (const entry of entries) {
        if (!entry.tags?.includes(tag)) continue;
        if (!best || entry.createdAt > best.entry.createdAt) {
          best = { entry, chapterNumber: session.chapterNumber };
        }
      }
    }
    return best;
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
