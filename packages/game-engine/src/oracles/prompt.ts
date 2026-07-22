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

export type LasersFeelingsOutcome = 'fail' | 'mixed' | 'success' | 'critical';

export interface LasersFeelingsResult {
  dice: number[];
  stat: number;
  mode: LasersFeelingsMode;
  /** True when at least one die succeeds (including Laser Feelings). */
  success: boolean;
  successes: number;
  outcome: LasersFeelingsOutcome;
  /** At least one die matched the Number exactly. */
  laserFeelings: boolean;
  /** Highest die (counselor) or lowest die (monster) — useful for display. */
  highest: number;
}

export interface ResolveLasersFeelingsOptions {
  /** Dice to roll (1–3). Default 1. Prepared / expert / help are applied by the caller. */
  diceCount?: number;
  rng?: Rng;
}

function outcomeFromSuccesses(successes: number): LasersFeelingsOutcome {
  if (successes <= 0) return 'fail';
  if (successes === 1) return 'mixed';
  if (successes === 2) return 'success';
  return 'critical';
}

/**
 * Lasers & Feelings / Camp Snallygaster resolution.
 * Counselor = roll over Number; Monster = roll under Number.
 * Exact match is Laser Feelings (counts as a success) and grants insight.
 */
export function resolveLasersFeelings(
  stat: number,
  mode: LasersFeelingsMode,
  options: ResolveLasersFeelingsOptions = {},
): LasersFeelingsResult {
  const { diceCount = 1, rng = defaultRng } = options;
  const clamped = Math.max(1, Math.min(6, Math.round(stat)));
  const count = Math.max(1, Math.min(3, Math.round(diceCount)));

  const dice: number[] = [];
  for (let i = 0; i < count; i++) {
    dice.push(rollInt(1, 6, rng));
  }

  let successes = 0;
  let laserFeelings = false;
  for (const die of dice) {
    if (die === clamped) {
      successes += 1;
      laserFeelings = true;
      continue;
    }
    if (mode === 'counselor' ? die > clamped : die < clamped) {
      successes += 1;
    }
  }

  const highest = mode === 'counselor' ? Math.max(...dice) : Math.min(...dice);

  return {
    dice,
    stat: clamped,
    mode,
    success: successes > 0,
    successes,
    outcome: outcomeFromSuccesses(successes),
    laserFeelings,
    highest,
  };
}
