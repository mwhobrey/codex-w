import { isStorageConfigured, uploadAsset } from '@/lib/storage';
import { NextResponse } from 'next/server';
import { requireServerSession } from '@/lib/auth-server';

function storageUnavailable() {
  return NextResponse.json(
    { error: 'Object storage is not configured', code: 'STORAGE_NOT_CONFIGURED' },
    { status: 503 },
  );
}

function unauthorized() {
  return NextResponse.json({ error: 'Sign in required', code: 'UNAUTHORIZED' }, { status: 401 });
}

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isStorageConfigured()) return storageUnavailable();

  const session = await requireServerSession();
  if (!session) return unauthorized();

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB)', code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const key = `users/${session.user.id}/${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadAsset(key, buffer, file.type || 'application/octet-stream');

  return NextResponse.json({ ok: true, key, url });
}
