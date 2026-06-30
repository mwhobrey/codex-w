import {
  syncRelayHttpProtocol,
  syncRelayRoomHttpUrl,
} from '@codex/sync/sync-relay-url';

/** @deprecated use syncRelayHttpProtocol */
export function partyKitWsProtocol(host: string): 'ws' | 'wss' {
  return syncRelayHttpProtocol(host) === 'http' ? 'ws' : 'wss';
}

/** Quick HTTP probe — avoids reconnect spam when the relay isn't running. */
export async function probeSyncRelayReachable(
  host: string,
  party: string,
  roomId: string,
  _inviteToken?: string,
  timeoutMs = 2000,
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const url = syncRelayRoomHttpUrl(host, roomId, party);

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    window.clearTimeout(timer);
    return res.ok || res.status === 404 || res.status === 204;
  } catch (err) {
    console.error('probeSyncRelayReachable failed for url:', url, err);
    return false;
  }
}

/** @deprecated use probeSyncRelayReachable */
export const probePartyKitReachable = probeSyncRelayReachable;

/** Atomically seed invite token via HTTP before opening the websocket. */
export async function seedSyncRelayInvite(
  host: string,
  party: string,
  roomId: string,
  inviteToken: string,
): Promise<boolean> {
  const url = `${syncRelayRoomHttpUrl(host, roomId, party)}?action=seed`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteToken }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to seed sync relay room invite:', err);
    return false;
  }
}

/** @deprecated use seedSyncRelayInvite */
export const seedPartyRoomInvite = seedSyncRelayInvite;
