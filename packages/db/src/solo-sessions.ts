import type { JournalEntry, SoloSession } from '@codex/schemas';
import { eq } from 'drizzle-orm';
import type { CodexDb } from './client';
import { journalEntries, soloSessions } from './schema';

function rowToSession(row: typeof soloSessions.$inferSelect): SoloSession {
  return {
    id: row.id,
    ownerId: row.ownerId,
    gameSystemId: row.gameSystemId as SoloSession['gameSystemId'],
    name: row.name ?? undefined,
    characterId: row.characterId ?? undefined,
    sceneFocus: row.sceneFocus ?? undefined,
    gameState: row.gameState ?? undefined,
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
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listSoloSessionsByOwner(db: CodexDb, ownerId: string): Promise<SoloSession[]> {
  const rows = await db.select().from(soloSessions).where(eq(soloSessions.ownerId, ownerId));
  return rows.map(rowToSession);
}

export async function getSoloSessionById(db: CodexDb, id: string): Promise<SoloSession | null> {
  const rows = await db.select().from(soloSessions).where(eq(soloSessions.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToSession(row) : null;
}

export async function upsertSoloSession(db: CodexDb, session: SoloSession): Promise<void> {
  await db
    .insert(soloSessions)
    .values({
      id: session.id,
      ownerId: session.ownerId,
      gameSystemId: session.gameSystemId,
      name: session.name ?? null,
      characterId: session.characterId ?? null,
      sceneFocus: session.sceneFocus ?? null,
      gameState: session.gameState ?? null,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    })
    .onConflictDoUpdate({
      target: soloSessions.id,
      set: {
        name: session.name ?? null,
        characterId: session.characterId ?? null,
        sceneFocus: session.sceneFocus ?? null,
        gameState: session.gameState ?? null,
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
      createdAt: new Date(entry.createdAt),
    })
    .onConflictDoUpdate({
      target: journalEntries.id,
      set: {
        type: entry.type,
        content: entry.content,
        metadata: entry.metadata ?? null,
        createdAt: new Date(entry.createdAt),
      },
    });
}
