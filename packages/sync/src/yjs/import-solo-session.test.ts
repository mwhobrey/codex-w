import { describe, expect, it, beforeEach } from 'vitest';
import * as Y from 'yjs';
import {
  tableMetaFromSoloSession,
  isSoloSessionImported,
  importSoloSessionToTable,
} from './import-solo-session';
import { readTableMeta } from './table-meta';
import { getPlayRoomLogArray } from './play-room-doc';
import type { SoloSession, JournalEntry } from '@codex/schemas';

describe('import-solo-session', () => {
  let doc: Y.Doc;

  beforeEach(() => {
    doc = new Y.Doc();
  });

  const mockSession: SoloSession = {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    gameSystemId: 'loner',
    name: 'My Solo Adventure',
    characterId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    sceneFocus: 'Campfire talks',
    gameState: {
      customValue: 'arbitrary-state',
    },
    createdAt: '2026-06-27T00:00:00Z',
    updatedAt: '2026-06-27T01:00:00Z',
  };

  const mockJournalEntries: JournalEntry[] = [
    {
      id: 'j-1',
      sessionId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
      type: 'scene',
      content: 'Wrote some notes',
      createdAt: '2026-06-27T00:10:00Z',
    },
    {
      id: 'j-2',
      sessionId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
      type: 'oracle',
      content: 'Rolled yes/no',
      createdAt: '2026-06-27T00:20:00Z',
    },
  ];

  describe('tableMetaFromSoloSession', () => {
    it('correctly builds a TableMeta partial from SoloSession', () => {
      const partial = tableMetaFromSoloSession(mockSession);
      expect(partial.gameSystemId).toBe('loner');
      expect(partial.name).toBe('My Solo Adventure');
      expect(partial.characterId).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(partial.sceneFocus).toBe('Campfire talks');
      expect(partial.gameState).toEqual({
        customValue: 'arbitrary-state',
        importedSoloSessionId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
      });
    });
  });

  describe('isSoloSessionImported', () => {
    it('returns false if meta is empty or has a different importedSoloSessionId', () => {
      expect(isSoloSessionImported(doc, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(false);
    });

    it('returns true if meta has matching importedSoloSessionId', () => {
      importSoloSessionToTable(doc, 'room-1', mockSession, []);
      expect(isSoloSessionImported(doc, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6')).toBe(true);
    });
  });

  describe('importSoloSessionToTable', () => {
    it('applies metadata updates and appends all log entries when importing', () => {
      const meta = importSoloSessionToTable(doc, 'room-1', mockSession, mockJournalEntries);

      // Verify meta
      expect(meta.gameSystemId).toBe('loner');
      expect(meta.name).toBe('My Solo Adventure');
      expect(meta.gameState?.importedSoloSessionId).toBe('f81d4fae-7dec-11d0-a765-00a0c91e6bf6');
      expect(readTableMeta(doc).characterId).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

      // Verify log entries in doc
      const logArray = getPlayRoomLogArray(doc);
      const items = logArray.toArray();
      expect(items).toHaveLength(2);
      expect(items[0]).toMatchObject({
        roomId: 'room-1',
        type: 'scene',
        content: 'Wrote some notes',
        author: 'Archive',
        createdAt: '2026-06-27T00:10:00Z',
      });
      expect(items[1]).toMatchObject({
        roomId: 'room-1',
        type: 'oracle',
        content: 'Rolled yes/no',
        author: 'Archive',
        createdAt: '2026-06-27T00:20:00Z',
      });
    });

    it('skips import if the session was already imported', () => {
      // First import
      importSoloSessionToTable(doc, 'room-1', mockSession, mockJournalEntries);

      // Mutate the doc log to verify second import doesn't run
      const logArray = getPlayRoomLogArray(doc);
      doc.transact(() => {
        logArray.delete(0, logArray.length);
      });

      // Second import
      importSoloSessionToTable(doc, 'room-1', mockSession, mockJournalEntries);

      // Log array should remain empty because it was skipped
      expect(logArray.length).toBe(0);
    });
  });
});
