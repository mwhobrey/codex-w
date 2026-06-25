import {
  getDb,
  getSoloSessionById,
  isDatabaseConfigured,
  upsertJournalEntry,
} from '@codex/db';
import { JournalEntrySchema } from '@codex/schemas';
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const { id: sessionId } = await params;
  const body: unknown = await request.json();
  const parsed = JournalEntrySchema.safeParse(
    typeof body === 'object' && body !== null && 'entry' in body
      ? (body as { entry: unknown }).entry
      : body,
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid journal entry', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.sessionId !== sessionId) {
    return NextResponse.json({ error: 'Session mismatch', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const soloSession = await getSoloSessionById(getDb(), sessionId);
  if (soloSession && soloSession.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  await upsertJournalEntry(getDb(), parsed.data, session.user.id);

  return NextResponse.json({ ok: true, synced: true, id: parsed.data.id });
}
