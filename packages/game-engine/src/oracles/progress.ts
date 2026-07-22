import type { Rng } from '../rng';
import { defaultRng, rollInt } from '../rng';

export type IronswornOutcome = 'strong' | 'weak' | 'miss';

export type IronswornChallengeRank =
  | 'troublesome'
  | 'dangerous'
  | 'formidable'
  | 'extreme'
  | 'epic';

/** Ticks marked per progress mark, by rank (4 ticks = 1 box). */
export const IRONSWORN_TICKS_PER_MARK: Record<IronswornChallengeRank, number> = {
  troublesome: 12, // 3 boxes
  dangerous: 8, // 2 boxes
  formidable: 4, // 1 box
  extreme: 2, // 2 ticks
  epic: 1, // 1 tick
};

export const IRONSWORN_PROGRESS_BOXES = 10;
export const IRONSWORN_TICKS_PER_BOX = 4;
export const IRONSWORN_MAX_TICKS = IRONSWORN_PROGRESS_BOXES * IRONSWORN_TICKS_PER_BOX;

export interface ActionRollResult {
  actionDie: number;
  challengeDice: [number, number];
  /** Stat + adds (+ action die unless cancelled by negative momentum). */
  actionScore: number;
  stat: number;
  adds: number;
  outcome: IronswornOutcome;
  match: boolean;
  /** Action die was cancelled due to negative momentum. */
  actionDieCancelled: boolean;
}

export interface ProgressRollResult {
  progressScore: number;
  challengeDice: [number, number];
  outcome: IronswornOutcome;
  match: boolean;
}

export interface ResolveActionRollInput {
  stat: number;
  adds?: number;
  momentum?: number;
  rng?: Rng;
}

/**
 * Ironsworn action roll: 1d6 + stat + adds vs 2d10 challenge dice.
 * Action score must exceed (not equal) each challenge die for a hit.
 * Negative momentum matching the action die cancels the action die.
 */
export function resolveActionRoll(input: ResolveActionRollInput): ActionRollResult {
  const rng = input.rng ?? defaultRng;
  const stat = Math.max(0, Math.min(5, Math.round(input.stat)));
  const adds = Math.max(0, Math.min(10, Math.round(input.adds ?? 0)));
  const momentum = input.momentum ?? 0;

  const actionDie = rollInt(1, 6, rng);
  const challengeDice: [number, number] = [rollInt(1, 10, rng), rollInt(1, 10, rng)];

  const actionDieCancelled = momentum < 0 && actionDie === Math.abs(momentum);
  const effectiveActionDie = actionDieCancelled ? 0 : actionDie;
  const actionScore = effectiveActionDie + stat + adds;

  const beatsFirst = actionScore > challengeDice[0];
  const beatsSecond = actionScore > challengeDice[1];
  const hits = (beatsFirst ? 1 : 0) + (beatsSecond ? 1 : 0);
  const outcome: IronswornOutcome =
    hits === 2 ? 'strong' : hits === 1 ? 'weak' : 'miss';
  const match = challengeDice[0] === challengeDice[1];

  return {
    actionDie,
    challengeDice,
    actionScore,
    stat,
    adds,
    outcome,
    match,
    actionDieCancelled,
  };
}

/**
 * Burn momentum: cancel challenge dice that are less than current momentum.
 * Returns a new outcome; does not mutate momentum (caller resets to reset value).
 */
export function applyBurnMomentum(
  roll: ActionRollResult,
  momentum: number,
): ActionRollResult {
  if (momentum <= 0) return roll;
  const cancelled: [boolean, boolean] = [
    roll.challengeDice[0] < momentum,
    roll.challengeDice[1] < momentum,
  ];
  const beatsFirst = cancelled[0] || roll.actionScore > roll.challengeDice[0];
  const beatsSecond = cancelled[1] || roll.actionScore > roll.challengeDice[1];
  const hits = (beatsFirst ? 1 : 0) + (beatsSecond ? 1 : 0);
  return {
    ...roll,
    outcome: hits === 2 ? 'strong' : hits === 1 ? 'weak' : 'miss',
  };
}

export function resolveProgressRoll(
  progressScore: number,
  rng: Rng = defaultRng,
): ProgressRollResult {
  const score = Math.max(0, Math.min(10, Math.round(progressScore)));
  const challengeDice: [number, number] = [rollInt(1, 10, rng), rollInt(1, 10, rng)];
  const beatsFirst = score > challengeDice[0];
  const beatsSecond = score > challengeDice[1];
  const hits = (beatsFirst ? 1 : 0) + (beatsSecond ? 1 : 0);
  return {
    progressScore: score,
    challengeDice,
    outcome: hits === 2 ? 'strong' : hits === 1 ? 'weak' : 'miss',
    match: challengeDice[0] === challengeDice[1],
  };
}

export function markProgressTicks(
  currentTicks: number,
  rank: IronswornChallengeRank,
  marks = 1,
): number {
  const add = IRONSWORN_TICKS_PER_MARK[rank] * Math.max(1, marks);
  return Math.max(0, Math.min(IRONSWORN_MAX_TICKS, currentTicks + add));
}

/** Fully filled boxes (4 ticks each) count toward progress score. */
export function progressScoreFromTicks(ticks: number): number {
  const clamped = Math.max(0, Math.min(IRONSWORN_MAX_TICKS, ticks));
  return Math.floor(clamped / IRONSWORN_TICKS_PER_BOX);
}
