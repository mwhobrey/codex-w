const TABLE_INVITE_KEY = (roomId: string) => `codex-table-invite-${roomId}`;

export function readStoredTableInvite(roomId: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(TABLE_INVITE_KEY(roomId));
  return stored?.trim() || undefined;
}

export function writeStoredTableInvite(roomId: string, inviteToken: string | undefined): void {
  if (typeof window === 'undefined') return;
  const trimmed = inviteToken?.trim();
  if (trimmed) window.localStorage.setItem(TABLE_INVITE_KEY(roomId), trimmed);
  else window.localStorage.removeItem(TABLE_INVITE_KEY(roomId));
}
