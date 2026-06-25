import { INVITE_QUERY_PARAM } from '@codex/sync';

export function getPartyKitHost(): string {
  return process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? '127.0.0.1:1999';
}

export function getPartyKitParty(): string {
  return process.env.NEXT_PUBLIC_PARTYKIT_PARTY ?? 'main';
}

export function shouldConnectPartyKit(): boolean {
  return process.env.NEXT_PUBLIC_PARTYKIT_CONNECT !== 'false';
}

export function partyKitWsParams(inviteToken?: string): Record<string, string> | undefined {
  const invite = inviteToken?.trim();
  if (!invite) return undefined;
  return { [INVITE_QUERY_PARAM]: invite };
}

export function createPlayRoomUrl(
  roomId: string,
  gameSystemId?: string,
  inviteToken?: string,
): string {
  const params = new URLSearchParams();
  if (gameSystemId) params.set('system', gameSystemId);
  if (inviteToken?.trim()) params.set(INVITE_QUERY_PARAM, inviteToken.trim());
  const qs = params.toString();
  const path = `/play/${encodeURIComponent(roomId)}`;
  if (typeof window === 'undefined') {
    return qs ? `${path}?${qs}` : path;
  }
  return `${window.location.origin}${path}${qs ? `?${qs}` : ''}`;
}

export function parseInviteToken(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
