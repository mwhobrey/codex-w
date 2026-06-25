import Dexie, { type Table } from 'dexie';
import type { CharacterSheet, DiceSet, JournalEntry, SoloSession } from '@codex/schemas';

export class CodexDatabase extends Dexie {
  characterSheets!: Table<CharacterSheet, string>;
  soloSessions!: Table<SoloSession, string>;
  journalEntries!: Table<JournalEntry, string>;
  diceSets!: Table<DiceSet, string>;

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
