import type { Rng } from '../rng';
import { defaultRng, rollInt } from '../rng';

export type ForgeRollOutcome = 'strong' | 'weak' | 'miss';

export interface ForgeRollResult {
  dice: [number, number];
  modifier: number;
  total: number;
  target: number;
  outcome: ForgeRollOutcome;
  progressGain: number;
}

/** Ironforge-style progress roll: 2d6 + modifier vs target */
export function resolveForgeRoll(
  modifier: number,
  target: number,
  rng: Rng = defaultRng,
): ForgeRollResult {
  const dice: [number, number] = [rollInt(1, 6, rng), rollInt(1, 6, rng)];
  const mod = Math.max(0, Math.min(5, Math.round(modifier)));
  const total = dice[0] + dice[1] + mod;
  const clampedTarget = Math.max(2, Math.min(15, Math.round(target)));

  let outcome: ForgeRollOutcome = 'miss';
  let progressGain = 0;

  if (total >= clampedTarget + 3) {
    outcome = 'strong';
    progressGain = 2;
  } else if (total >= clampedTarget) {
    outcome = 'weak';
    progressGain = 1;
  }

  return { dice, modifier: mod, total, target: clampedTarget, outcome, progressGain };
}
