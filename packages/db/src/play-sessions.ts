import type { JournalEntry, PlaySession } from '@codex/schemas';
import { and, eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { journalEntries, playSessions } from './schema';

function rowToSession(row: typeof playSessions.$inferSelect): PlaySession {
  return {
    id: row.id,
    ownerId: row.ownerId,
    gameSystemId: row.gameSystemId as PlaySession['gameSystemId'],
    name: row.name ?? undefined,
    characterId: row.characterId ?? undefined,
    sceneFocus: row.sceneFocus ?? undefined,
    gameState: row.gameState ?? undefined,
    roomId: row.roomId ?? undefined,
    chapterNumber: row.chapterNumber ?? undefined,
    status: (row.status as PlaySession['status']) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function rowToJournal(row: typeof journalEntries.$inferSelect): JournalEntry {
  return {
    id: row.id,
    sessionId: row.sessionId,
    type: row.type as JournalEntry['type'],
    content: row.content,
    metadata: row.metadata ?? undefined,
    tags: (row.tags as string[] | null) ?? undefined,
    pinned: row.pinned ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPlaySessionsByOwner(db: CodexDb, ownerId: string): Promise<PlaySession[]> {
  const rows = await db.select().from(playSessions).where(eq(playSessions.ownerId, ownerId));
  return rows.map(rowToSession);
}

export async function listPlaySessionsByRoom(
  db: CodexDb,
  ownerId: string,
  roomId: string,
): Promise<PlaySession[]> {
  const rows = await db
    .select()
    .from(playSessions)
    .where(and(eq(playSessions.ownerId, ownerId), eq(playSessions.roomId, roomId)));
  return rows.map(rowToSession);
}

export async function getPlaySessionById(db: CodexDb, id: string): Promise<PlaySession | null> {
  const rows = await db.select().from(playSessions).where(eq(playSessions.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToSession(row) : null;
}

export async function upsertPlaySession(db: CodexDb, session: PlaySession): Promise<void> {
  await db
    .insert(playSessions)
    .values({
      id: session.id,
      ownerId: session.ownerId,
      gameSystemId: session.gameSystemId,
      name: session.name ?? null,
      characterId: session.characterId ?? null,
      sceneFocus: session.sceneFocus ?? null,
      gameState: session.gameState ?? null,
      roomId: session.roomId ?? null,
      chapterNumber: session.chapterNumber ?? null,
      status: session.status ?? null,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    })
    .onConflictDoUpdate({
      target: playSessions.id,
      set: {
        name: session.name ?? null,
        characterId: session.characterId ?? null,
        sceneFocus: session.sceneFocus ?? null,
        gameState: session.gameState ?? null,
        roomId: session.roomId ?? null,
        chapterNumber: session.chapterNumber ?? null,
        status: session.status ?? null,
        updatedAt: new Date(session.updatedAt),
      },
    });
}

export async function listJournalEntriesByOwner(
  db: CodexDb,
  ownerId: string,
): Promise<JournalEntry[]> {
  const rows = await db.select().from(journalEntries).where(eq(journalEntries.ownerId, ownerId));
  return rows.map(rowToJournal);
}

export async function listJournalEntriesBySession(
  db: CodexDb,
  sessionId: string,
): Promise<JournalEntry[]> {
  const rows = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.sessionId, sessionId));
  return rows.map(rowToJournal);
}

export interface JournalSearchOptions {
  tag?: string;
  type?: JournalEntry['type'];
  text?: string;
  gameSystemId?: string;
}

/** Search journal entries across all of an owner's chapters (in-process filter — table is small per owner). */
export async function searchJournalEntries(
  db: CodexDb,
  ownerId: string,
  options: JournalSearchOptions = {},
): Promise<JournalEntry[]> {
  const sessions = await listPlaySessionsByOwner(db, ownerId);
  const sessionsBySystem = options.gameSystemId
    ? new Set(sessions.filter((s) => s.gameSystemId === options.gameSystemId).map((s) => s.id))
    : null;

  const entries = await listJournalEntriesByOwner(db, ownerId);
  return entries.filter((entry) => {
    if (sessionsBySystem && !sessionsBySystem.has(entry.sessionId)) return false;
    if (options.type && entry.type !== options.type) return false;
    if (options.tag && !entry.tags?.includes(options.tag)) return false;
    if (options.text && !entry.content.toLowerCase().includes(options.text.toLowerCase())) return false;
    return true;
  });
}

export async function upsertJournalEntry(
  db: CodexDb,
  entry: JournalEntry,
  ownerId: string,
): Promise<void> {
  await db
    .insert(journalEntries)
    .values({
      id: entry.id,
      sessionId: entry.sessionId,
      ownerId,
      type: entry.type,
      content: entry.content,
      metadata: entry.metadata ?? null,
      tags: entry.tags ?? null,
      pinned: entry.pinned ?? false,
      createdAt: new Date(entry.createdAt),
    })
    .onConflictDoUpdate({
      target: journalEntries.id,
      set: {
        type: entry.type,
        content: entry.content,
        metadata: entry.metadata ?? null,
        tags: entry.tags ?? null,
        pinned: entry.pinned ?? false,
        createdAt: new Date(entry.createdAt),
      },
    });
}
