import type {
  JournalEntry,
  JournalEntryType,
  PlaySession,
  PlaySessionLogEntry,
  PlaySessionLogEntryType,
  TableMeta,
} from '@codex/schemas';

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function mapPlayLogTypeToJournalType(type: PlaySessionLogEntryType): JournalEntryType {
  switch (type) {
    case 'roll':
    case 'journal':
    case 'system':
      return 'note';
    default:
      return type;
  }
}

export interface ExportTableToPlaySessionOptions {
  name?: string;
  roomId?: string;
  chapterNumber?: number;
  /** Reuse an existing chapter's id (re-closing a reopened chapter) instead of minting a new one. */
  existingSessionId?: string;
}

export function exportTableToPlaySession(
  meta: TableMeta,
  logEntries: PlaySessionLogEntry[],
  ownerId: string,
  options?: ExportTableToPlaySessionOptions,
): { session: PlaySession; journalEntries: JournalEntry[] } {
  const now = new Date().toISOString();
  const sessionId = options?.existingSessionId ?? createId();

  const session: PlaySession = {
    id: sessionId,
    ownerId,
    name: options?.name?.trim() || meta.name || 'Exported table',
    gameSystemId: meta.gameSystemId,
    characterId: meta.characterId,
    sceneFocus: meta.sceneFocus,
    gameState: meta.gameState,
    roomId: options?.roomId,
    chapterNumber: options?.chapterNumber,
    status: 'closed',
    createdAt: now,
    updatedAt: now,
  };

  const journalEntries: JournalEntry[] = logEntries.map((entry) => ({
    id: createId(),
    sessionId,
    type: mapPlayLogTypeToJournalType(entry.type),
    content: entry.author ? `${entry.author}: ${entry.content}` : entry.content,
    tags: entry.tags,
    pinned: entry.pinned,
    createdAt: entry.createdAt,
  }));

  return { session, journalEntries };
}
