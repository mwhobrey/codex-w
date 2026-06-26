import {
  getDb,
  isDatabaseConfigured,
  listCharacterSheetsByOwner,
  listDiceSetsByOwner,
  listJournalEntriesByOwner,
  listLibraryTablesByOwner,
  listSoloSessionsByOwner,
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

  const [sheets, sessions, journalEntries, diceSets, libraryTables] = await Promise.all([
    listCharacterSheetsByOwner(db, ownerId),
    listSoloSessionsByOwner(db, ownerId),
    listJournalEntriesByOwner(db, ownerId),
    listDiceSetsByOwner(db, ownerId),
    listLibraryTablesByOwner(db, ownerId),
  ]);

  return NextResponse.json({
    sheets,
    sessions,
    journalEntries,
    diceSets,
    libraryTables,
    synced: true,
  });
}
