export function getPartyKitHost(): string {
  return process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? '127.0.0.1:1999';
}

export function getPartyKitParty(): string {
  return process.env.NEXT_PUBLIC_PARTYKIT_PARTY ?? 'main';
}

export function shouldConnectPartyKit(): boolean {
  return process.env.NEXT_PUBLIC_PARTYKIT_CONNECT !== 'false';
}

export function createPlayRoomUrl(roomId: string): string {
  if (typeof window === 'undefined') {
    return `/play/${roomId}`;
  }
  return `${window.location.origin}/play/${roomId}`;
}
