import {
  getDb,
  getPlayRoomById,
  isDatabaseConfigured,
  listPlayRoomsByOwner,
  upsertPlayRoom,
} from '@codex/db';
import { PlayRoomSchema } from '@codex/schemas';
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
      rooms: [],
      message: 'Cloud sync not configured.',
    });
  }

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const rooms = await listPlayRoomsByOwner(getDb(), session.user.id);
  return NextResponse.json({ rooms, synced: true });
}

export async function PUT(request: Request) {
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

  const existing = await getPlayRoomById(getDb(), parsed.data.roomId);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const room = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertPlayRoom(getDb(), room);
  return NextResponse.json({ room, synced: true });
}
