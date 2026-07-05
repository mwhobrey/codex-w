import { describe, expect, it } from 'vitest';
import { closeChapter } from './chapter-lifecycle';
import { createPlayRoomDoc, getPlayRoomLogArray } from './play-room-doc';
import { readTableMeta, writeTableMeta } from './table-meta';
import type { PlaySessionLogEntry } from '@codex/schemas';

const logEntries: PlaySessionLogEntry[] = [
  {
    id: 'log-1',
    roomId: 'room-1',
    type: 'scene',
    content: 'The party arrives',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
];

describe('closeChapter', () => {
  it('archives the log, clears it, and bumps the chapter number', () => {
    const doc = createPlayRoomDoc();
    writeTableMeta(doc, { gameSystemId: 'loner', name: 'Night run' });

    const result = closeChapter(doc, 'room-1', logEntries, 'owner-1', 'Alex');

    expect(result.session.chapterNumber).toBe(1);
    expect(result.session.roomId).toBe('room-1');
    expect(result.journalEntries).toHaveLength(1);
    expect(readTableMeta(doc).chapterNumber).toBe(2);

    const liveLog = getPlayRoomLogArray(doc).toArray();
    expect(liveLog).toHaveLength(1);
    expect(liveLog[0]?.content).toContain('Chapter 1 closed by Alex');
  });

  it('reuses the existing chapter session id when re-closing a reopened chapter', () => {
    const doc = createPlayRoomDoc();
    writeTableMeta(doc, {
      gameSystemId: 'loner',
      name: 'Night run',
      chapterNumber: 3,
      gameState: { currentChapterSessionId: 'chapter-3-id' },
    });

    const result = closeChapter(doc, 'room-1', logEntries, 'owner-1');

    expect(result.session.id).toBe('chapter-3-id');
    expect(result.session.chapterNumber).toBe(3);
    expect(readTableMeta(doc).chapterNumber).toBe(4);
    expect(readTableMeta(doc).gameState?.currentChapterSessionId).toBeUndefined();
  });
});
