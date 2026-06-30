import type * as Party from 'partykit/server';
import {
  INVITE_QUERY_PARAM,
  admissionAfterInviteSeed,
  checkRoomInviteAdmission,
  isValidInviteToken,
  parseInviteFromUri,
} from '@codex/sync/room-invite';
import { guardedOnConnect } from './guarded-connect';

const ROOM_INVITE_STORAGE_KEY = 'inviteToken';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function admitWithInviteGate(
  room: Party.Room,
  provided: string | null,
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const stored = (await room.storage.get<string>(ROOM_INVITE_STORAGE_KEY)) ?? null;
  if (!stored) {
    return { allowed: false, reason: 'invite_required' };
  }

  const admission = checkRoomInviteAdmission(stored, provided);
  if (!admission.allowed) {
    return { allowed: false, reason: admission.reason };
  }

  return { allowed: true };
}

export default class PlayRoomServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method === 'POST') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'seed') {
        try {
          const body = (await req.json()) as { inviteToken?: string };
          const inviteToken = body.inviteToken?.trim();

          if (!isValidInviteToken(inviteToken)) {
            return new Response(JSON.stringify({ error: 'invalid_invite' }), {
              status: 400,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }

          const stored = await this.room.storage.get<string>(ROOM_INVITE_STORAGE_KEY);
          if (stored) {
            if (stored === inviteToken) {
              return new Response(JSON.stringify({ success: true, alreadySeeded: true }), {
                status: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
              });
            }
            return new Response(JSON.stringify({ error: 'room_already_seeded' }), {
              status: 409,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }

          await this.room.storage.put(ROOM_INVITE_STORAGE_KEY, inviteToken);
          return new Response(JSON.stringify({ success: true, seeded: true }), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'bad_request' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const provided =
      parseInviteFromUri(conn.uri) ??
      new URL(ctx.request.url).searchParams.get(INVITE_QUERY_PARAM);

    const admission = await admitWithInviteGate(this.room, provided);

    if (!admission.allowed) {
      conn.close(4403, admission.reason);
      return;
    }

    return guardedOnConnect(conn, this.room, {
      persist: { mode: 'snapshot' },
    });
  }
}

PlayRoomServer satisfies Party.Worker;
