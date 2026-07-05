import type { JournalEntry, PlaySession, PlaySessionLogEntry, TableMeta } from '@codex/schemas';
import type * as Y from 'yjs';
import { exportTableToPlaySession } from '../export-table-session';
import { getPlayRoomLogArray } from './play-room-doc';
import { appendPlayRoomLogEntry } from './play-room-log';
import { patchTableMeta, readTableMeta } from './table-meta';

export interface CloseChapterResult {
  session: PlaySession;
  journalEntries: JournalEntry[];
  meta: TableMeta;
}

/**
 * End Session: archive the live log as a chapter, clear it, and bump the
 * chapter counter. If the live log is a reopened chapter (tracked via
 * `gameState.currentChapterSessionId`), re-closing it updates that chapter's
 * existing record instead of minting a new one.
 */
export function closeChapter(
  doc: Y.Doc,
  roomId: string,
  logEntries: PlaySessionLogEntry[],
  ownerId: string,
  gmName?: string,
): CloseChapterResult {
  const meta = readTableMeta(doc);
  const existingSessionId = meta.gameState?.currentChapterSessionId as string | undefined;
  const chapterNumber = meta.chapterNumber ?? 1;

  const { session, journalEntries } = exportTableToPlaySession(meta, logEntries, ownerId, {
    roomId,
    chapterNumber,
    existingSessionId,
  });

  const logArray = getPlayRoomLogArray(doc);
  doc.transact(() => {
    logArray.delete(0, logArray.length);
  });

  const { currentChapterSessionId: _current, importedSoloSessionId: _imported, ...restGameState } =
    meta.gameState ?? {};

  const nextMeta = patchTableMeta(doc, {
    chapterNumber: chapterNumber + 1,
    gameState: restGameState,
  });

  appendPlayRoomLogEntry(doc, {
    roomId,
    type: 'system',
    content: `Chapter ${chapterNumber} closed${gmName ? ` by ${gmName}` : ''}.`,
    author: 'System',
  });

  return { session, journalEntries, meta: nextMeta };
}
