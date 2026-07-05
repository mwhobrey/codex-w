import type { JournalEntry, PlaySession, TableMeta } from '@codex/schemas';
import type * as Y from 'yjs';
import { appendPlayRoomLogEntry } from './play-room-log';
import { patchTableMeta, readTableMeta } from './table-meta';

export function tableMetaFromPlaySession(session: PlaySession): Partial<TableMeta> {
  return {
    gameSystemId: session.gameSystemId,
    name: session.name,
    characterId: session.characterId,
    sceneFocus: session.sceneFocus,
    chapterNumber: session.chapterNumber,
    gameState: {
      ...session.gameState,
      importedSoloSessionId: session.id,
      currentChapterSessionId: session.id,
    },
  };
}

export function isPlaySessionImported(doc: Y.Doc, sessionId: string): boolean {
  const meta = readTableMeta(doc);
  return meta.gameState?.importedSoloSessionId === sessionId;
}

/**
 * Reopen a closed chapter into a live table. Always replays — a chapter may be
 * resumed even if it was previously imported/closed, so "reopen" keeps working
 * after subsequent close/reopen cycles instead of being a one-shot action.
 */
export function importPlaySessionToTable(
  doc: Y.Doc,
  roomId: string,
  session: PlaySession,
  journalEntries: JournalEntry[],
): TableMeta {
  const meta = patchTableMeta(doc, tableMetaFromPlaySession(session));

  for (const entry of journalEntries) {
    appendPlayRoomLogEntry(doc, {
      roomId,
      type: entry.type,
      content: entry.content,
      author: 'Archive',
      createdAt: entry.createdAt,
      tags: entry.tags,
      pinned: entry.pinned,
    });
  }

  return meta;
}
