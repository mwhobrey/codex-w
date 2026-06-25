/** Quick websocket probe — avoids y-partykit reconnect spam when PartyKit isn't running. */
export function probePartyKitReachable(
  host: string,
  party: string,
  roomId: string,
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

    const ws = new WebSocket(`ws://${host}/parties/${party}/${roomId}`);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => finish(true);
    ws.onerror = () => finish(false);
  });
}
