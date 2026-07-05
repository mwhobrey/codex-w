import Dexie, { type Table } from 'dexie';
import type {
  CharacterSheet,
  DiceSet,
  JournalEntry,
  PlayerNote,
  PlaySession,
  SavedTag,
  UserLibraryTable,
} from '@codex/schemas';

export type CharacterPortraitRow = {
  characterId: string;
  blob: Blob;
  mimeType: string;
  updatedAt: string;
};

export class CodexDatabase extends Dexie {
  characterSheets!: Table<CharacterSheet, string>;
  playSessions!: Table<PlaySession, string>;
  journalEntries!: Table<JournalEntry, string>;
  diceSets!: Table<DiceSet, string>;
  userLibraryTables!: Table<UserLibraryTable, string>;
  characterPortraits!: Table<CharacterPortraitRow, string>;
  savedTags!: Table<SavedTag, string>;
  playerNotes!: Table<PlayerNote, string>;

  constructor(name = 'codex-w') {
    super(name);
    this.version(1).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
    });
    this.version(2).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      soloSessions: 'id, gameSystemId, ownerId, updatedAt',
      journalEntries: 'id, sessionId, createdAt',
    });
    this.version(3).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      soloSessions: 'id, gameSystemId, ownerId, updatedAt',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
    });
    this.version(5).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      soloSessions: 'id, gameSystemId, ownerId, updatedAt',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
      userLibraryTables: 'id, ownerId, updatedAt, name, category',
      characterPortraits: 'characterId, updatedAt',
    });
    this.version(6)
      .stores({
        characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
        soloSessions: null,
        playSessions: 'id, gameSystemId, ownerId, updatedAt, roomId',
        journalEntries: 'id, sessionId, createdAt',
        diceSets: 'id, ownerId, updatedAt, name',
        userLibraryTables: 'id, ownerId, updatedAt, name, category',
        characterPortraits: 'characterId, updatedAt',
        savedTags: 'id, ownerId, label, lastUsedAt',
      })
      .upgrade(async (tx) => {
        const oldSessions = await tx.table('soloSessions').toArray();
        if (oldSessions.length > 0) {
          await tx.table('playSessions').bulkPut(oldSessions);
        }
      });
    this.version(7).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      playSessions: 'id, gameSystemId, ownerId, updatedAt, roomId',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
      userLibraryTables: 'id, ownerId, updatedAt, name, category',
      characterPortraits: 'characterId, updatedAt',
      savedTags: 'id, ownerId, label, lastUsedAt',
      playerNotes: 'id, ownerId, roomId, createdAt, [ownerId+roomId]',
    });
  }
}

let dbInstance: CodexDatabase | null = null;

export function getDatabase(): CodexDatabase {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is only available in the browser');
  }
  if (!dbInstance) {
    dbInstance = new CodexDatabase();
  }
  return dbInstance;
}

/** Reset for tests — do not use in production UI */
export function resetDatabaseForTests(): void {
  dbInstance = null;
}
