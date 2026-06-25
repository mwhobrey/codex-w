import {
  deleteCharacterSheet,
  getCharacterSheetById,
  getDb,
  isDatabaseConfigured,
  listCharacterSheetsByOwner,
  upsertCharacterSheet,
} from '@codex/db';
import { CharacterSheetSchema } from '@codex/schemas';
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
  if (!isDatabaseConfigured()) return cloudUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const sheets = await listCharacterSheetsByOwner(getDb(), session.user.id);
  return NextResponse.json({ sheets, synced: true });
}

export async function POST(request: Request) {
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

  const sheet = {
    ...parsed.data,
    ownerId: session.user.id,
    updatedAt: new Date().toISOString(),
  };

  await upsertCharacterSheet(getDb(), sheet);

  return NextResponse.json({
    ok: true,
    synced: true,
    id: sheet.id,
  });
}
