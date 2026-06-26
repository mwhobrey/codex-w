export const INVITE_QUERY_PARAM = 'invite';
export const INVITE_TOKEN_MIN_LENGTH = 16;

export function generateInviteToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function isValidInviteToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && token.trim().length >= INVITE_TOKEN_MIN_LENGTH;
}

/** Prefer the first valid invite from URL, Yjs meta, storage, or recent tables. */
export function resolveTableInviteToken(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const candidate of candidates) {
    if (isValidInviteToken(candidate)) return candidate!.trim();
  }
  return undefined;
}

export function parseInviteFromUri(uri: string): string | null {
  try {
    const url = new URL(uri);
    const invite = url.searchParams.get(INVITE_QUERY_PARAM)?.trim();
    return invite || null;
  } catch {
    return null;
  }
}

export type InviteAdmissionResult =
  | { allowed: true; seeded: boolean }
  | { allowed: false; reason: 'invite_required' | 'invite_invalid' };

/** Pure invite gate — server persists `storedToken` in room storage. */
export function checkRoomInviteAdmission(
  storedToken: string | null | undefined,
  providedToken: string | null | undefined,
): InviteAdmissionResult {
  const stored = storedToken?.trim();
  const provided = providedToken?.trim();

  if (!stored) {
    if (!isValidInviteToken(provided)) {
      return { allowed: false, reason: 'invite_required' };
    }
    return { allowed: true, seeded: true };
  }

  if (provided !== stored) {
    return { allowed: false, reason: 'invite_invalid' };
  }

  return { allowed: true, seeded: false };
}
