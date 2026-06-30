import { INVITE_QUERY_PARAM, parseInviteFromUri } from '@codex/sync';

export function getSyncRelayHost(): string {
  return (
    process.env.NEXT_PUBLIC_SYNC_HOST?.trim() ||
    process.env.NEXT_PUBLIC_PARTYKIT_HOST?.trim() ||
    '127.0.0.1:1999'
  );
}

/** @deprecated use getSyncRelayHost */
export const getPartyKitHost = getSyncRelayHost;

export function getSyncRelayParty(): string {
  return (
    process.env.NEXT_PUBLIC_SYNC_PARTY?.trim() ||
    process.env.NEXT_PUBLIC_PARTYKIT_PARTY?.trim() ||
    'main'
  );
}

/** @deprecated use getSyncRelayParty */
export const getPartyKitParty = getSyncRelayParty;

export function shouldConnectSyncRelay(): boolean {
  const raw =
    process.env.NEXT_PUBLIC_SYNC_CONNECT ?? process.env.NEXT_PUBLIC_PARTYKIT_CONNECT ?? 'true';
  return raw !== 'false';
}

/** @deprecated use shouldConnectSyncRelay */
export const shouldConnectPartyKit = shouldConnectSyncRelay;

export function syncRelayWsParams(inviteToken?: string): Record<string, string> | undefined {
  const invite = inviteToken?.trim();
  if (!invite) return undefined;
  return { [INVITE_QUERY_PARAM]: invite };
}

/** @deprecated use syncRelayWsParams */
export const partyKitWsParams = syncRelayWsParams;

export interface PlayRoomPathOptions {
  gameSystemId?: string;
  importSessionId?: string;
  inviteToken?: string;
}

export function buildPlayRoomPath(
  roomId: string,
  options?: PlayRoomPathOptions,
): string {
  const params = new URLSearchParams();
  if (options?.gameSystemId) params.set('system', options.gameSystemId);
  if (options?.importSessionId) params.set('import', options.importSessionId);
  if (options?.inviteToken?.trim()) params.set(INVITE_QUERY_PARAM, options.inviteToken.trim());
  const qs = params.toString();
  const path = `/play/${encodeURIComponent(roomId)}`;
  return qs ? `${path}?${qs}` : path;
}

export function createPlayRoomUrl(
  roomId: string,
  gameSystemId?: string,
  inviteToken?: string,
): string {
  const path = buildPlayRoomPath(roomId, { gameSystemId, inviteToken });
  if (typeof window === 'undefined') {
    return path;
  }
  return `${window.location.origin}${path}`;
}

export function parseInviteToken(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

const PLAY_ROOM_PATH_RE = /\/play\/([^/?#]+)/;

/** Parse a pasted invite link, URL, or bare room ID into room + optional invite token. */
export function parseTableInviteInput(input: string): {
  roomId?: string;
  inviteToken?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return {};

  if (trimmed.includes('://') || trimmed.startsWith('/')) {
    try {
      const url = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'https://codex.local');
      const match = url.pathname.match(PLAY_ROOM_PATH_RE);
      const roomId = match?.[1] ? decodeURIComponent(match[1]) : undefined;
      const inviteToken = parseInviteFromUri(url.href) ?? undefined;
      return { roomId, inviteToken: inviteToken ?? undefined };
    } catch {
      return {};
    }
  }

  if (PLAY_ROOM_PATH_RE.test(trimmed)) {
    const match = trimmed.match(PLAY_ROOM_PATH_RE);
    const roomId = match?.[1] ? decodeURIComponent(match[1]) : undefined;
    return { roomId };
  }

  if (/^[a-f0-9]{12,32}$/i.test(trimmed)) {
    return { roomId: trimmed };
  }

  return {};
}
