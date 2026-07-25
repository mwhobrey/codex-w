import {
  characterSheetRepo,
  diceSetRepo,
  isCharacterSheetDeleted,
  journalRepo,
  playerNoteRepo,
  playSessionRepo,
  savedTagRepo,
  userLibraryTableRepo,
} from '@codex/sync';
import type {
  CharacterSheet,
  DiceSet,
  JournalEntry,
  PlayerNote,
  PlayRoom,
  PlaySession,
  SavedTag,
  UserLibraryTable,
} from '@codex/schemas';
import { getLocalOwnerId } from '@/lib/local-owner';
import { syncPendingPortraitUploads } from '@/lib/portrait-cloud-sync';
import { pushDiceSetSync } from '@/lib/dice-set-sync';
import { pushLibraryTableSync } from '@/lib/library-table-sync';
import { pushPlayerNoteSync } from '@/lib/player-note-sync';
import { pushJournalSync, pushSessionSync } from '@/lib/session-sync';
import { pushSavedTagSync } from '@/lib/saved-tag-sync';
import { pushSheetSync } from '@/lib/sheet-sync';
import { mergeCloudPlayRooms } from '@/lib/recent-play-rooms';

interface CloudSyncPayload {
  sheets: CharacterSheet[];
  sessions: PlaySession[];
  journalEntries: JournalEntry[];
  diceSets: DiceSet[];
  libraryTables: UserLibraryTable[];
  savedTags: SavedTag[];
  playerNotes: PlayerNote[];
  rooms: PlayRoom[];
}

function isNewer(isoA: string, isoB: string): boolean {
  return new Date(isoA).getTime() > new Date(isoB).getTime();
}

async function mergeSheet(remote: CharacterSheet, userId: string): Promise<void> {
  if (isCharacterSheetDeleted(remote.id)) return;

  const local = await characterSheetRepo.get(remote.id);
  const next: CharacterSheet = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await characterSheetRepo.save(next);
}

async function mergePlaySession(remote: PlaySession, userId: string): Promise<void> {
  const local = await playSessionRepo.get(remote.id);
  const next: PlaySession = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await playSessionRepo.save(next);
}

async function mergeJournal(remote: JournalEntry): Promise<void> {
  const localEntries = await journalRepo.listBySession(remote.sessionId);
  const local = localEntries.find((entry) => entry.id === remote.id);
  if (local && !isNewer(remote.createdAt, local.createdAt)) return;
  await journalRepo.append(remote);
}

async function mergeDiceSet(remote: DiceSet, userId: string): Promise<void> {
  const local = await diceSetRepo.get(remote.id);
  const next: DiceSet = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await diceSetRepo.save(next);
}

async function mergeLibraryTable(remote: UserLibraryTable, userId: string): Promise<void> {
  const local = await userLibraryTableRepo.get(remote.id);
  const next: UserLibraryTable = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await userLibraryTableRepo.save(next);
}

async function mergeSavedTag(remote: SavedTag, userId: string): Promise<void> {
  const local = await savedTagRepo.get(remote.id);
  const next: SavedTag = {
    ...(local && isNewer(local.lastUsedAt, remote.lastUsedAt) ? local : remote),
    ownerId: userId,
  };
  await savedTagRepo.save(next);
}

async function mergePlayerNote(remote: PlayerNote, userId: string): Promise<void> {
  const localNotes = await playerNoteRepo.listByRoom(userId, remote.roomId);
  if (localNotes.some((note) => note.id === remote.id)) return;
  await playerNoteRepo.append({ ...remote, ownerId: userId });
}

async function migrateLocalOwnerToUser(localOwnerId: string, userId: string): Promise<void> {
  if (localOwnerId === userId) return;

  const sheets = await characterSheetRepo.listByOwner(localOwnerId);
  for (const sheet of sheets) {
    const migrated = { ...sheet, ownerId: userId };
    await characterSheetRepo.save(migrated);
    void pushSheetSync(migrated);
  }

  const sessions = await playSessionRepo.listByOwner(localOwnerId);
  for (const session of sessions) {
    const migrated = { ...session, ownerId: userId };
    await playSessionRepo.save(migrated);
    void pushSessionSync(migrated);

    const entries = await journalRepo.listBySession(session.id);
    for (const entry of entries) {
      void pushJournalSync(entry, userId);
    }
  }

  const diceSets = await diceSetRepo.listByOwner(localOwnerId);
  for (const set of diceSets) {
    const migrated = { ...set, ownerId: userId };
    await diceSetRepo.save(migrated);
    void pushDiceSetSync(migrated);
  }

  const libraryTables = await userLibraryTableRepo.listByOwner(localOwnerId);
  for (const table of libraryTables) {
    const migrated = { ...table, ownerId: userId };
    await userLibraryTableRepo.save(migrated);
    void pushLibraryTableSync(migrated);
  }

  const savedTags = await savedTagRepo.listByOwner(localOwnerId);
  for (const tag of savedTags) {
    const migrated = { ...tag, ownerId: userId };
    await savedTagRepo.save(migrated);
    void pushSavedTagSync(migrated);
  }

  const playerNotes = await playerNoteRepo.listByOwner(localOwnerId);
  for (const note of playerNotes) {
    const migrated = { ...note, ownerId: userId };
    await playerNoteRepo.append(migrated);
    void pushPlayerNoteSync(migrated);
  }
}

/** Pull cloud data and merge anonymous local records into the signed-in account. */
export async function pullCloudData(userId: string): Promise<void> {
  const localOwnerId = getLocalOwnerId();
  await migrateLocalOwnerToUser(localOwnerId, userId);

  try {
    const res = await fetch('/api/sync', { credentials: 'include' });
    if (res.status === 401 || res.status === 503) return;
    if (!res.ok) return;

    const payload = (await res.json()) as CloudSyncPayload;

    for (const sheet of payload.sheets ?? []) {
      await mergeSheet(sheet, userId);
    }
    for (const session of payload.sessions ?? []) {
      await mergePlaySession(session, userId);
    }
    for (const entry of payload.journalEntries ?? []) {
      await mergeJournal(entry);
    }
    for (const set of payload.diceSets ?? []) {
      await mergeDiceSet(set, userId);
    }
    for (const table of payload.libraryTables ?? []) {
      await mergeLibraryTable(table, userId);
    }
    for (const tag of payload.savedTags ?? []) {
      await mergeSavedTag(tag, userId);
    }
    for (const note of payload.playerNotes ?? []) {
      await mergePlayerNote(note, userId);
    }

    mergeCloudPlayRooms(payload.rooms ?? []);

    await syncPendingPortraitUploads(userId);
  } catch {
    // Offline or misconfigured — local-first still works.
  }
}
