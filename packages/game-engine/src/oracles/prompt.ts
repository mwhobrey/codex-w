import type { Rng } from '../rng';
import { defaultRng, rollInt } from '../rng';

export function advancePromptIndex(
  current: number,
  min: number,
  max: number,
  rng: Rng = defaultRng,
): { next: number; delta: number; d10: number; d6: number } {
  const d10 = rollInt(1, 10, rng);
  const d6 = rollInt(1, 6, rng);
  const delta = d10 - d6;
  const raw = current + delta;
  const next = Math.max(min, Math.min(max, raw));
  return { next, delta, d10, d6 };
}

export type LasersFeelingsMode = 'counselor' | 'monster';

export interface LasersFeelingsResult {
  dice: [number, number, number];
  stat: number;
  mode: LasersFeelingsMode;
  success: boolean;
  highest: number;
}

/** Camp Snallygaster style: roll 3d6, succeed if sum relation to stat (counselor: any die > stat, monster: any die < stat) */
export function resolveLasersFeelings(
  stat: number,
  mode: LasersFeelingsMode,
  rng: Rng = defaultRng,
): LasersFeelingsResult {
  const clamped = Math.max(1, Math.min(6, Math.round(stat)));
  const dice: [number, number, number] = [
    rollInt(1, 6, rng),
    rollInt(1, 6, rng),
    rollInt(1, 6, rng),
  ];
  const highest = Math.max(...dice);
  const lowest = Math.min(...dice);
  const success =
    mode === 'counselor' ? dice.some((d) => d > clamped) : dice.some((d) => d < clamped);

  return {
    dice,
    stat: clamped,
    mode,
    success,
    highest: mode === 'counselor' ? highest : lowest,
  };
}
