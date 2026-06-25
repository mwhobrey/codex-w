import { getAuth, isAuthConfigured } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse } from 'next/server';

function notConfigured() {
  return NextResponse.json(
    { error: 'Cloud auth is not configured on this deployment', code: 'AUTH_NOT_CONFIGURED' },
    { status: 503 },
  );
}

const handler = isAuthConfigured()
  ? toNextJsHandler(getAuth())
  : { GET: notConfigured, POST: notConfigured };

export const GET = handler.GET;
export const POST = handler.POST;
