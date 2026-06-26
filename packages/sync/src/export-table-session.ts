import type {
  JournalEntry,
  JournalEntryType,
  PlaySessionLogEntry,
  PlaySessionLogEntryType,
  SoloSession,
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

export function exportTableToSoloSession(
  meta: TableMeta,
  logEntries: PlaySessionLogEntry[],
  ownerId: string,
  options?: { name?: string },
): { session: SoloSession; journalEntries: JournalEntry[] } {
  const now = new Date().toISOString();
  const sessionId = createId();

  const session: SoloSession = {
    id: sessionId,
    ownerId,
    name: options?.name?.trim() || meta.name || 'Exported table',
    gameSystemId: meta.gameSystemId,
    characterId: meta.characterId,
    sceneFocus: meta.sceneFocus,
    gameState: meta.gameState,
    createdAt: now,
    updatedAt: now,
  };

  const journalEntries: JournalEntry[] = logEntries.map((entry) => ({
    id: createId(),
    sessionId,
    type: mapPlayLogTypeToJournalType(entry.type),
    content: entry.author ? `${entry.author}: ${entry.content}` : entry.content,
    createdAt: entry.createdAt,
  }));

  return { session, journalEntries };
}
