import {
  getDb,
  getSoloSessionById,
  isDatabaseConfigured,
  upsertSoloSession,
} from '@codex/db';
import { SoloSessionSchema } from '@codex/schemas';
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = SoloSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid solo session', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: 'ID mismatch', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const existing = await getSoloSessionById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const soloSession = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertSoloSession(getDb(), soloSession);

  return NextResponse.json({ ok: true, synced: true, id: soloSession.id });
}
