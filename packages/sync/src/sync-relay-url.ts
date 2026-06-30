/** Build websocket URL for the self-hosted Hocuspocus relay. */
export function syncRelayWebSocketUrl(host: string): string {
  const normalized = host.replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '');
  const isLocal =
    normalized.startsWith('localhost:') ||
    normalized.startsWith('127.0.0.1:') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('10.') ||
    (normalized.startsWith('172.') &&
      Number(normalized.split('.')[1]) >= 16 &&
      Number(normalized.split('.')[1]) <= 31);

  const protocol = isLocal ? 'ws' : 'wss';
  return `${protocol}://${normalized}`;
}

/** Match relay local-vs-remote HTTP protocol selection. */
export function syncRelayHttpProtocol(host: string): 'http' | 'https' {
  return syncRelayWebSocketUrl(host).startsWith('ws://') ? 'http' : 'https';
}

/** PartyKit-compatible room HTTP path (seed + health probe). */
export function syncRelayRoomHttpUrl(host: string, roomId: string, party = 'main'): string {
  const protocol = syncRelayHttpProtocol(host);
  const cleanHost = host.replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '');
  return `${protocol}://${cleanHost}/parties/${party}/${roomId}`;
}
