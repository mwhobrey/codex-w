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

/** Quick websocket probe — avoids y-partykit reconnect spam when PartyKit isn't running. */
export function probePartyKitReachable(
  host: string,
  party: string,
  roomId: string,
  inviteToken?: string,
  timeoutMs = 2000,
): Promise<boolean> {
  if (typeof WebSocket === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        // ignore
      }
      resolve(ok);
    };

    const inviteQs = inviteToken?.trim()
      ? `?invite=${encodeURIComponent(inviteToken.trim())}`
      : '';
    const protocol = partyKitWsProtocol(host);
    const ws = new WebSocket(`${protocol}://${host}/parties/${party}/${roomId}${inviteQs}`);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => {
      window.setTimeout(() => {
        if (!settled && ws.readyState === WebSocket.OPEN) finish(true);
      }, 50);
    };
    ws.onclose = (event) => {
      if (event.code === 4403) finish(false);
    };
    ws.onerror = () => finish(false);
  });
}
