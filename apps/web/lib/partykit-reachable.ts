/** Match y-partykit local-vs-remote websocket protocol selection. */
export function partyKitWsProtocol(host: string): 'ws' | 'wss' {
  const normalized = host.replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '');
  if (
    normalized.startsWith('localhost:') ||
    normalized.startsWith('127.0.0.1:') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('10.') ||
    (normalized.startsWith('172.') &&
      Number(normalized.split('.')[1]) >= 16 &&
      Number(normalized.split('.')[1]) <= 31)
  ) {
    return 'ws';
  }
  return 'wss';
}

/** Quick HTTP probe — avoids y-partykit reconnect spam when PartyKit isn't running. */
export async function probePartyKitReachable(
  host: string,
  party: string,
  roomId: string,
  inviteToken?: string,
  timeoutMs = 2000,
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const wsProtocol = partyKitWsProtocol(host);
  const httpProtocol = wsProtocol === 'ws' ? 'http' : 'https';
  const cleanHost = host.replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '');
  const url = `${httpProtocol}://${cleanHost}/parties/${party}/${roomId}`;

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    window.clearTimeout(timer);
    return res.ok || res.status === 404 || res.status === 204;
  } catch (err) {
    console.error('probePartyKitReachable failed for url:', url, err);
    return false;
  }
}

/** Atomically seed invite token on PartyKit via HTTP before connecting via WebSocket. */
export async function seedPartyRoomInvite(
  host: string,
  party: string,
  roomId: string,
  inviteToken: string,
): Promise<boolean> {
  const wsProtocol = partyKitWsProtocol(host);
  const httpProtocol = wsProtocol === 'ws' ? 'http' : 'https';
  const cleanHost = host.replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '');
  const url = `${httpProtocol}://${cleanHost}/parties/${party}/${roomId}?action=seed`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteToken }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to seed PartyKit room invite:', err);
    return false;
  }
}
