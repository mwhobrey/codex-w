import {
  deleteSavedTag,
  getDb,
  getSavedTagById,
  isDatabaseConfigured,
  upsertSavedTag,
} from '@codex/db';
import { SavedTagSchema } from '@codex/schemas';
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

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const body: unknown = await request.json();
  const parsed = SavedTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid saved tag', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: 'ID mismatch', code: 'ID_MISMATCH' }, { status: 400 });
  }

  const existing = await getSavedTagById(getDb(), id);
  if (existing && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const savedTag = {
    ...parsed.data,
    ownerId: session.user.id,
    lastUsedAt: new Date().toISOString(),
  };

  await upsertSavedTag(getDb(), savedTag);

  return NextResponse.json({ ok: true, synced: true, id: savedTag.id });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const deleted = await deleteSavedTag(getDb(), id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, synced: true, id });
}
