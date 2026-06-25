import {
  deleteDiceSet,
  getDiceSetById,
  getDb,
  isDatabaseConfigured,
  upsertDiceSet,
} from '@codex/db';
import { DiceSetSchema } from '@codex/schemas';
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
      diceSet: null,
      id,
      message: 'Cloud sync not configured. Read from IndexedDB on the client.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const diceSet = await getDiceSetById(getDb(), id);
  if (!diceSet || diceSet.ownerId !== session.user.id) {
    return NextResponse.json({ diceSet: null, id }, { status: 404 });
  }

  return NextResponse.json({ diceSet, id, synced: true });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = DiceSetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid dice set', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: 'ID mismatch', code: 'ID_MISMATCH' }, { status: 400 });
  }

  const existing = await getDiceSetById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const diceSet = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertDiceSet(getDb(), diceSet);

  return NextResponse.json({ ok: true, synced: true, id });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const deleted = await deleteDiceSet(getDb(), id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, synced: true, id });
}
