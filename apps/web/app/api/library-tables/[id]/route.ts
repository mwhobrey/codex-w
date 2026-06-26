import {
  deleteLibraryTable,
  getLibraryTableById,
  getDb,
  isDatabaseConfigured,
  upsertLibraryTable,
} from '@codex/db';
import { UserLibraryTableSchema } from '@codex/schemas';
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
      libraryTable: null,
      id,
      message: 'Cloud sync not configured. Read from IndexedDB on the client.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const libraryTable = await getLibraryTableById(getDb(), id);
  if (!libraryTable || libraryTable.ownerId !== session.user.id) {
    return NextResponse.json({ libraryTable: null, id }, { status: 404 });
  }

  return NextResponse.json({ libraryTable, id, synced: true });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = UserLibraryTableSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid library table', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: 'ID mismatch', code: 'ID_MISMATCH' }, { status: 400 });
  }

  const existing = await getLibraryTableById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const libraryTable = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertLibraryTable(getDb(), libraryTable);

  return NextResponse.json({ ok: true, synced: true, id });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const deleted = await deleteLibraryTable(getDb(), id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, synced: true, id });
}
