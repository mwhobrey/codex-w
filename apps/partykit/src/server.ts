import type * as Party from 'partykit/server';
import {
  INVITE_QUERY_PARAM,
  checkRoomInviteAdmission,
  parseInviteFromUri,
} from '@codex/sync';
import { onConnect } from 'y-partykit';

const ROOM_INVITE_STORAGE_KEY = 'inviteToken';

export default class PlayRoomServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const provided =
      parseInviteFromUri(conn.uri) ??
      new URL(ctx.request.url).searchParams.get(INVITE_QUERY_PARAM);

    const stored = (await this.room.storage.get<string>(ROOM_INVITE_STORAGE_KEY)) ?? null;
    const admission = checkRoomInviteAdmission(stored, provided);

    if (!admission.allowed) {
      conn.close(4403, admission.reason);
      return;
    }

    if (admission.seeded && provided) {
      await this.room.storage.put(ROOM_INVITE_STORAGE_KEY, provided.trim());
    }

    return onConnect(conn, this.room, {
      persist: { mode: 'snapshot' },
    });
  }
}

PlayRoomServer satisfies Party.Worker;
