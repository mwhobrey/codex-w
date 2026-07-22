import {
  deletePlayRoom,
  getDb,
  getPlayRoomById,
  isDatabaseConfigured,
  upsertPlayRoom,
} from '@codex/db';
import { PlayRoomSchema } from '@codex/schemas';
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
      room: null,
      id,
      message: 'Cloud sync not configured.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const room = await getPlayRoomById(getDb(), id);
  if (!room || room.ownerId !== session.user.id) {
    return NextResponse.json({ room: null, id }, { status: 404 });
  }

  return NextResponse.json({ room, id, synced: true });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = PlayRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid play room', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.roomId !== id) {
    return NextResponse.json({ error: 'ID mismatch', code: 'ID_MISMATCH' }, { status: 400 });
  }

  const existing = await getPlayRoomById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const room = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertPlayRoom(getDb(), room);
  return NextResponse.json({ room, id, synced: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const deleted = await deletePlayRoom(getDb(), id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ id, deleted: true, synced: true });
}
