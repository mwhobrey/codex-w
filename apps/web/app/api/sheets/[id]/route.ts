import {
  deleteCharacterSheet,
  getCharacterSheetById,
  getDb,
  isDatabaseConfigured,
  upsertCharacterSheet,
} from '@codex/db';
import { CharacterSheetSchema } from '@codex/schemas';
import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth-server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function cloudUnavailable() {
  return NextResponse.json(
    { error: 'Cloud sync is not configured', code: 'CLOUD_NOT_CONFIGURED', synced: false },
    { status: 503 },
  );
}

function unauthorized() {
  return NextResponse.json({ error: 'Sign in required', code: 'UNAUTHORIZED' }, { status: 401 });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      sheet: null,
      id,
      message: 'Cloud sync not configured. Read from IndexedDB on the client.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const sheet = await getCharacterSheetById(getDb(), id);
  if (!sheet || sheet.ownerId !== session.user.id) {
    return NextResponse.json({ sheet: null, id }, { status: 404 });
  }

  return NextResponse.json({ sheet, id, synced: true });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = CharacterSheetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid character sheet', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json(
      { error: 'Sheet ID mismatch', code: 'ID_MISMATCH' },
      { status: 400 },
    );
  }

  const existing = await getCharacterSheetById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const sheet = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertCharacterSheet(getDb(), sheet);

  return NextResponse.json({
    ok: true,
    synced: true,
    id,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const deleted = await deleteCharacterSheet(getDb(), id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, synced: true, id });
}
