import { appendPlayerNote, getDb, isDatabaseConfigured, listPlayerNotesByOwner, listPlayerNotesByRoom } from '@codex/db';
import { PlayerNoteSchema } from '@codex/schemas';
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

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const roomId = new URL(request.url).searchParams.get('roomId');
  const playerNotes = roomId
    ? await listPlayerNotesByRoom(getDb(), session.user.id, roomId)
    : await listPlayerNotesByOwner(getDb(), session.user.id);

  return NextResponse.json({ playerNotes, synced: true });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = PlayerNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid player note', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const playerNote = { ...parsed.data, ownerId: session.user.id };
  await appendPlayerNote(getDb(), playerNote);

  return NextResponse.json({ ok: true, synced: true, id: playerNote.id });
}
