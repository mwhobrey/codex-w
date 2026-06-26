import { isStorageConfigured } from '@/lib/storage';
import { requireServerSession } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await requireServerSession();
  return NextResponse.json({
    configured: isStorageConfigured(),
    signedIn: Boolean(session),
    canUpload: isStorageConfigured() && Boolean(session),
  });
}
