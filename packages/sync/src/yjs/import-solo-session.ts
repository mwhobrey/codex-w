import type { JournalEntry, SoloSession, TableMeta } from '@codex/schemas';
import type * as Y from 'yjs';
import { appendPlayRoomLogEntry } from './play-room-log';
import { patchTableMeta, readTableMeta } from './table-meta';

export function tableMetaFromSoloSession(session: SoloSession): Partial<TableMeta> {
  return {
    gameSystemId: session.gameSystemId,
    name: session.name,
    characterId: session.characterId,
    sceneFocus: session.sceneFocus,
    gameState: {
      ...session.gameState,
      importedSoloSessionId: session.id,
    },
  };
}

export function isSoloSessionImported(doc: Y.Doc, sessionId: string): boolean {
  const meta = readTableMeta(doc);
  return meta.gameState?.importedSoloSessionId === sessionId;
}

export function importSoloSessionToTable(
  doc: Y.Doc,
  roomId: string,
  session: SoloSession,
  journalEntries: JournalEntry[],
): TableMeta {
  if (isSoloSessionImported(doc, session.id)) {
    return readTableMeta(doc);
  }

  const meta = patchTableMeta(doc, tableMetaFromSoloSession(session));

  for (const entry of journalEntries) {
    appendPlayRoomLogEntry(doc, {
      roomId,
      type: entry.type,
      content: entry.content,
      author: 'Archive',
      createdAt: entry.createdAt,
    });
  }

  return meta;
}
