import {
  checkRoomInviteAdmission,
  isValidInviteToken,
} from '@codex/sync/room-invite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getRoomInvite, seedRoomInvite } from './invite-store.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** PartyKit-compatible path: /parties/main/:roomId */
const ROOM_PATH = /^\/parties\/main\/([^/]+)\/?$/;

function parseRoomId(pathname: string): string | null {
  const match = pathname.match(ROOM_PATH);
  return match?.[1] ?? null;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

/** HTTP routes for health probe + invite seeding (matches legacy PartyKit client paths). */
export async function handleHttpRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return true;
  }

  const roomId = parseRoomId(url.pathname);
  if (!roomId) {
    return false;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return true;
  }

  if (req.method === 'POST' && url.searchParams.get('action') === 'seed') {
    const body = (await readJsonBody(req)) as { inviteToken?: string } | null;
    if (body === null) {
      sendJson(res, 400, { error: 'bad_request' });
      return true;
    }

    const inviteToken = body.inviteToken?.trim();
    if (!isValidInviteToken(inviteToken)) {
      sendJson(res, 400, { error: 'invalid_invite' });
      return true;
    }

    const result = seedRoomInvite(roomId, inviteToken!);
    if (result === 'conflict') {
      sendJson(res, 409, { error: 'room_already_seeded' });
      return true;
    }
    if (result === 'already') {
      sendJson(res, 200, { success: true, alreadySeeded: true });
      return true;
    }

    sendJson(res, 200, { success: true, seeded: true });
    return true;
  }

  res.writeHead(404, CORS_HEADERS);
  res.end('Not Found');
  return true;
}

export function admitWebSocket(roomId: string, inviteToken: string | null): { allowed: true } | { allowed: false; reason: string } {
  const stored = getRoomInvite(roomId);
  if (!stored) {
    return { allowed: false, reason: 'invite_required' };
  }

  const admission = checkRoomInviteAdmission(stored, inviteToken);
  if (!admission.allowed) {
    return { allowed: false, reason: admission.reason };
  }

  return { allowed: true };
}
