import {
  getDb,
  isDatabaseConfigured,
  listLibraryTablesByOwner,
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
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      libraryTables: [],
      message: 'Cloud sync not configured. Read from IndexedDB on the client.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const libraryTables = await listLibraryTablesByOwner(getDb(), session.user.id);
  return NextResponse.json({ libraryTables, synced: true });
}
