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

/**
 * Standalone dice-hub roll history — local-only, no cloud sync. `rolledAt` is
 * the primary key (each roll's own ISO timestamp), matching what the log UI
 * already used as its React key.
 */
export interface DiceRollHistoryEntry {
  ownerId: string;
  notation: string;
  total: number;
  rolledAt: string;
}

/** Durable cloud mutation queue row (Phase D). */
export type CloudMutationEntity =
  | 'sheet'
  | 'sheet-delete'
  | 'dice-set'
  | 'library-table'
  | 'player-note'
  | 'saved-tag'
  | 'session'
  | 'journal'
  | 'play-room';

export interface CloudMutationRecord {
  id: string;
  /** Dedupes pending writes for the same resource (keep latest). */
  dedupeKey: string;
  entity: CloudMutationEntity;
  method: 'PUT' | 'POST' | 'DELETE';
  url: string;
  body?: unknown;
  attempts: number;
  nextAttemptAt: number;
  createdAt: string;
}

export class CodexDatabase extends Dexie {
  characterSheets!: Table<CharacterSheet, string>;
  playSessions!: Table<PlaySession, string>;
  journalEntries!: Table<JournalEntry, string>;
  diceSets!: Table<DiceSet, string>;
  userLibraryTables!: Table<UserLibraryTable, string>;
  characterPortraits!: Table<CharacterPortraitRow, string>;
  savedTags!: Table<SavedTag, string>;
  playerNotes!: Table<PlayerNote, string>;
  diceRollHistory!: Table<DiceRollHistoryEntry, string>;
  cloudMutationQueue!: Table<CloudMutationRecord, string>;

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
    this.version(8).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      playSessions: 'id, gameSystemId, ownerId, updatedAt, roomId',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
      userLibraryTables: 'id, ownerId, updatedAt, name, category',
      characterPortraits: 'characterId, updatedAt',
      savedTags: 'id, ownerId, label, lastUsedAt',
      playerNotes: 'id, ownerId, roomId, createdAt, [ownerId+roomId]',
      diceRollHistory: 'rolledAt, ownerId',
    });
    this.version(9).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      playSessions: 'id, gameSystemId, ownerId, updatedAt, roomId',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
      userLibraryTables: 'id, ownerId, updatedAt, name, category',
      characterPortraits: 'characterId, updatedAt',
      savedTags: 'id, ownerId, label, lastUsedAt',
      playerNotes: 'id, ownerId, roomId, createdAt, [ownerId+roomId]',
      diceRollHistory: 'rolledAt, ownerId',
      cloudMutationQueue: 'id, dedupeKey, nextAttemptAt, entity',
    });
    this.version(10).stores({
      characterSheets: 'id, gameSystemId, ownerId, updatedAt, name',
      playSessions: 'id, gameSystemId, ownerId, updatedAt, roomId',
      journalEntries: 'id, sessionId, createdAt',
      diceSets: 'id, ownerId, updatedAt, name',
      userLibraryTables: 'id, ownerId, updatedAt, name, category',
      characterPortraits: 'characterId, updatedAt',
      savedTags: 'id, ownerId, label, lastUsedAt',
      playerNotes: 'id, ownerId, roomId, createdAt, [ownerId+roomId]',
      diceRollHistory: 'rolledAt, ownerId',
      cloudMutationQueue: 'id, dedupeKey, nextAttemptAt, createdAt, entity',
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

/** Delete IndexedDB + reset singleton (for unit tests). */
export async function deleteDatabaseForTests(): Promise<void> {
  const name = dbInstance?.name ?? 'codex-w';
  dbInstance = null;
  await Dexie.delete(name);
}
