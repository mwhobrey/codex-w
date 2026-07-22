import {
  getDb,
  isDatabaseConfigured,
  listCharacterSheetsByOwner,
  listDiceSetsByOwner,
  listJournalEntriesByOwner,
  listLibraryTablesByOwner,
  listPlayerNotesByOwner,
  listPlayRoomsByOwner,
  listPlaySessionsByOwner,
  listSavedTagsByOwner,
} from '@codex/db';
import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth-server';

function cloudUnavailable() {
  return NextResponse.json(
    { error: 'Cloud sync is not configured', code: 'CLOUD_NOT_CONFIGURED', synced: false },
    { status: 503 },
  );
}

function unauthorized() {
  return NextResponse.json({ error: 'Sign in required', code: 'UNAUTHORIZED' }, { status: 401 });
}

export async function GET() {
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const db = getDb();
  const ownerId = session.user.id;

  const [sheets, sessions, journalEntries, diceSets, libraryTables, savedTags, playerNotes, rooms] =
    await Promise.all([
      listCharacterSheetsByOwner(db, ownerId),
      listPlaySessionsByOwner(db, ownerId),
      listJournalEntriesByOwner(db, ownerId),
      listDiceSetsByOwner(db, ownerId),
      listLibraryTablesByOwner(db, ownerId),
      listSavedTagsByOwner(db, ownerId),
      listPlayerNotesByOwner(db, ownerId),
      listPlayRoomsByOwner(db, ownerId),
    ]);

  return NextResponse.json({
    sheets,
    sessions,
    journalEntries,
    diceSets,
    libraryTables,
    savedTags,
    playerNotes,
    rooms,
    synced: true,
  });
}
