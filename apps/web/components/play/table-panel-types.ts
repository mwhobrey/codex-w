import type { CharacterSheet, GameSystemId, PlaySessionLogEntry, TableMeta } from '@codex/schemas';

export interface TablePanelProps {
  gameSystemId: GameSystemId;
  meta: TableMeta;
  onUpdateMeta: (patch: Partial<TableMeta>) => void;
  onAppendLog: (
    entry: Omit<PlaySessionLogEntry, 'id' | 'roomId' | 'createdAt'>,
  ) => PlaySessionLogEntry | null;
  activeCharacter?: CharacterSheet | null;
  /** Label for log entries from this client (account name or table nickname). */
  logAuthor?: string;
}

export function readGameStateNumber(meta: TableMeta, key: string, fallback: number): number {
  const raw = meta.gameState?.[key];
  return typeof raw === 'number' ? raw : fallback;
}

export function patchGameState(
  meta: TableMeta,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return { ...(meta.gameState ?? {}), ...patch };
}
