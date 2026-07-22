import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue } from '../field-access';
import { updateSheetField } from '../types';

export type IronswornChallengeRank =
  | 'troublesome'
  | 'dangerous'
  | 'formidable'
  | 'extreme'
  | 'epic';

/** Ticks marked per progress mark (4 ticks = 1 box). Mirrors game-engine. */
export const IRONSWORN_TICKS_PER_MARK: Record<IronswornChallengeRank, number> = {
  troublesome: 12,
  dangerous: 8,
  formidable: 4,
  extreme: 2,
  epic: 1,
};

export const IRONSWORN_PROGRESS_BOXES = 10;
export const IRONSWORN_TICKS_PER_BOX = 4;
export const IRONSWORN_MAX_TICKS = IRONSWORN_PROGRESS_BOXES * IRONSWORN_TICKS_PER_BOX;

export interface IronswornVow {
  id: string;
  name: string;
  rank: IronswornChallengeRank;
  ticks: number;
}

export const IRONSWORN_RANKS: { id: IronswornChallengeRank; label: string }[] = [
  { id: 'troublesome', label: 'Troublesome' },
  { id: 'dangerous', label: 'Dangerous' },
  { id: 'formidable', label: 'Formidable' },
  { id: 'extreme', label: 'Extreme' },
  { id: 'epic', label: 'Epic' },
];

export const IRONSWORN_STATS = ['edge', 'heart', 'iron', 'shadow', 'wits'] as const;
export type IronswornStatKey = (typeof IRONSWORN_STATS)[number];

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `vow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function markProgressTicksLocal(
  currentTicks: number,
  rank: IronswornChallengeRank,
  marks = 1,
): number {
  const add = IRONSWORN_TICKS_PER_MARK[rank] * Math.max(1, marks);
  return Math.max(0, Math.min(IRONSWORN_MAX_TICKS, currentTicks + add));
}

export function progressScoreFromTicksLocal(ticks: number): number {
  const clamped = Math.max(0, Math.min(IRONSWORN_MAX_TICKS, ticks));
  return Math.floor(clamped / IRONSWORN_TICKS_PER_BOX);
}

export function readVowsFromGameState(gameState: Record<string, unknown> | undefined): IronswornVow[] {
  const raw = gameState?.vows;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      const id = typeof row.id === 'string' ? row.id : null;
      const name = typeof row.name === 'string' ? row.name : '';
      const rank = row.rank as IronswornChallengeRank;
      const ticks = typeof row.ticks === 'number' ? row.ticks : 0;
      if (!id || !IRONSWORN_RANKS.some((r) => r.id === rank)) return null;
      return { id, name, rank, ticks };
    })
    .filter((vow): vow is IronswornVow => vow !== null);
}

export function readActiveVowId(gameState: Record<string, unknown> | undefined): string | null {
  const id = gameState?.activeVowId;
  return typeof id === 'string' ? id : null;
}

export function vowsProgressScore(vow: IronswornVow): number {
  return progressScoreFromTicksLocal(vow.ticks);
}

export function vowsFilledBoxes(vow: IronswornVow): number {
  return Math.min(IRONSWORN_PROGRESS_BOXES, vowsProgressScore(vow));
}

export function createVow(name: string, rank: IronswornChallengeRank): IronswornVow {
  return { id: createId(), name: name.trim() || 'Iron vow', rank, ticks: 0 };
}

export function markVowProgress(vow: IronswornVow, marks = 1): IronswornVow {
  return { ...vow, ticks: markProgressTicksLocal(vow.ticks, vow.rank, marks) };
}

export function getStatValue(sheet: CharacterSheet | null | undefined, stat: IronswornStatKey): number {
  if (!sheet) return 0;
  const raw = Number(getSheetFieldValue(sheet, stat));
  if (Number.isNaN(raw)) return 0;
  return Math.max(0, Math.min(5, Math.round(raw)));
}

export function getMeterValue(
  sheet: CharacterSheet | null | undefined,
  key: 'momentum' | 'health' | 'spirit' | 'supply' | 'momentum_reset',
): number {
  if (!sheet) {
    if (key === 'momentum' || key === 'momentum_reset') return 2;
    return 5;
  }
  const raw = Number(getSheetFieldValue(sheet, key));
  if (Number.isNaN(raw)) {
    if (key === 'momentum' || key === 'momentum_reset') return 2;
    return 5;
  }
  if (key === 'momentum' || key === 'momentum_reset') return Math.max(-6, Math.min(10, Math.round(raw)));
  return Math.max(0, Math.min(5, Math.round(raw)));
}

export function patchMeter(
  sheet: CharacterSheet,
  key: 'momentum' | 'health' | 'spirit' | 'supply',
  value: number,
): CharacterSheet {
  let next = value;
  if (key === 'momentum') next = Math.max(-6, Math.min(10, Math.round(value)));
  else next = Math.max(0, Math.min(5, Math.round(value)));
  return updateSheetField(sheet, key, next);
}

export function burnMomentumOnSheet(sheet: CharacterSheet): CharacterSheet {
  const reset = getMeterValue(sheet, 'momentum_reset');
  return patchMeter(sheet, 'momentum', reset);
}
