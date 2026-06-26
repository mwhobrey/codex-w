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
    const ws = new WebSocket(`ws://${host}/parties/${party}/${roomId}${inviteQs}`);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => {
      // Server may accept then immediately close with 4403 when invite is missing/invalid.
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
