import {
  characterSheetRepo,
  diceSetRepo,
  journalRepo,
  soloSessionRepo,
  userLibraryTableRepo,
} from '@codex/sync';
import type {
  CharacterSheet,
  DiceSet,
  JournalEntry,
  SoloSession,
  UserLibraryTable,
} from '@codex/schemas';
import { getLocalOwnerId } from '@/lib/local-owner';
import { syncPendingPortraitUploads } from '@/lib/portrait-cloud-sync';
import { queueDiceSetSync } from '@/lib/dice-set-sync';
import { queueLibraryTableSync } from '@/lib/library-table-sync';
import { queueJournalSync, queueSessionSync } from '@/lib/session-sync';
import { queueSheetSync } from '@/lib/sheet-sync';

interface CloudSyncPayload {
  sheets: CharacterSheet[];
  sessions: SoloSession[];
  journalEntries: JournalEntry[];
  diceSets: DiceSet[];
  libraryTables: UserLibraryTable[];
}

function isNewer(isoA: string, isoB: string): boolean {
  return new Date(isoA).getTime() > new Date(isoB).getTime();
}

async function mergeSheet(remote: CharacterSheet, userId: string): Promise<void> {
  const local = await characterSheetRepo.get(remote.id);
  const next: CharacterSheet = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await characterSheetRepo.save(next);
}

async function mergeSession(remote: SoloSession, userId: string): Promise<void> {
  const local = await soloSessionRepo.get(remote.id);
  const next: SoloSession = {
    ...(local && isNewer(local.updatedAt, remote.updatedAt) ? local : remote),
    ownerId: userId,
  };
  await soloSessionRepo.save(next);
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

async function migrateLocalOwnerToUser(localOwnerId: string, userId: string): Promise<void> {
  if (localOwnerId === userId) return;

  const sheets = await characterSheetRepo.listByOwner(localOwnerId);
  for (const sheet of sheets) {
    const migrated = { ...sheet, ownerId: userId };
    await characterSheetRepo.save(migrated);
    void queueSheetSync(migrated);
  }

  const sessions = await soloSessionRepo.listByOwner(localOwnerId);
  for (const session of sessions) {
    const migrated = { ...session, ownerId: userId };
    await soloSessionRepo.save(migrated);
    void queueSessionSync(migrated);

    const entries = await journalRepo.listBySession(session.id);
    for (const entry of entries) {
      void queueJournalSync(entry, userId);
    }
  }

  const diceSets = await diceSetRepo.listByOwner(localOwnerId);
  for (const set of diceSets) {
    const migrated = { ...set, ownerId: userId };
    await diceSetRepo.save(migrated);
    void queueDiceSetSync(migrated);
  }

  const libraryTables = await userLibraryTableRepo.listByOwner(localOwnerId);
  for (const table of libraryTables) {
    const migrated = { ...table, ownerId: userId };
    await userLibraryTableRepo.save(migrated);
    void queueLibraryTableSync(migrated);
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
      await mergeSession(session, userId);
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

    await syncPendingPortraitUploads(userId);
  } catch {
    // Offline or misconfigured — local-first still works.
  }
}
