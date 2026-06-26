import type * as Party from 'partykit/server';
import {
  INVITE_QUERY_PARAM,
  admissionAfterInviteSeed,
  checkRoomInviteAdmission,
  isValidInviteToken,
  parseInviteFromUri,
} from '@codex/sync';
import { guardedOnConnect } from './guarded-connect';

const ROOM_INVITE_STORAGE_KEY = 'inviteToken';

async function admitWithInviteGate(
  room: Party.Room,
  provided: string | null,
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  let stored = (await room.storage.get<string>(ROOM_INVITE_STORAGE_KEY)) ?? null;
  let admission = checkRoomInviteAdmission(stored, provided);

  if (!admission.allowed) {
    return { allowed: false, reason: admission.reason };
  }

  if (admission.seeded && provided && isValidInviteToken(provided)) {
    const token = provided.trim();
    await room.storage.put(ROOM_INVITE_STORAGE_KEY, token);
    stored = (await room.storage.get<string>(ROOM_INVITE_STORAGE_KEY)) ?? null;
    admission = admissionAfterInviteSeed(stored, token);
    if (!admission.allowed) {
      return { allowed: false, reason: admission.reason };
    }
  }

  return { allowed: true };
}

export default class PlayRoomServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

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
