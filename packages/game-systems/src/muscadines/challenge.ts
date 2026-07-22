import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue, setSheetFieldValue } from '../field-access';
import { getMuscadinesBackground } from './backgrounds';
import {
  MUSCADINES_ATTRIBUTES,
  type MuscadinesAttribute,
  type MuscadinesDieRating,
} from './tables';

export interface MuscadinesChallengeState {
  handCards: number;
  challengeDR: number;
  challengeRS: number;
  challengeSuccesses: number;
  challengeLabel: string;
  festivalMode: boolean;
}

export interface MuscadinesCheckInput {
  attributeDie: MuscadinesDieRating | string;
  /** Extra impact dice as d6 count (feats / burned cards). */
  impactDice: number;
  cardsToBurn: number;
  handCards: number;
  challengeDR: number;
  challengeRS: number;
  challengeSuccesses: number;
  festivalMode?: boolean;
  /** Pre-rolled values: [attribute, ...impact]. If omitted, caller supplies rolls. */
  rolls: number[];
}

export interface MuscadinesCheckResult {
  total: number;
  rolls: number[];
  success: boolean;
  setback: boolean;
  successesGained: number;
  challengeSuccesses: number;
  challengeOvercome: boolean;
  handCards: number;
  challengeDR: number;
  cardsBurned: number;
  summary: string;
}

const DIE_SIDES: Record<string, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
};

export function parseDieRating(value: string | number | boolean | string[]): MuscadinesDieRating {
  const raw = String(value ?? 'd6').trim().toLowerCase();
  if (raw in DIE_SIDES) return raw as MuscadinesDieRating;
  const match = raw.match(/^1?d(4|6|8|10|12)$/i);
  if (match) return `d${match[1]}` as MuscadinesDieRating;
  return 'd6';
}

export function dieSides(rating: string): number {
  return DIE_SIDES[parseDieRating(rating)] ?? 6;
}

export function getAttributeDie(
  sheet: CharacterSheet | null | undefined,
  attribute: MuscadinesAttribute,
): MuscadinesDieRating {
  if (!sheet) return 'd6';
  return parseDieRating(getSheetFieldValue(sheet, attribute));
}

export function getEndurance(sheet: CharacterSheet | null | undefined): number {
  if (!sheet) return 6;
  const n = Number(getSheetFieldValue(sheet, 'endurance'));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 6;
}

export function adjustEndurance(sheet: CharacterSheet, delta: number): CharacterSheet {
  const next = Math.max(0, getEndurance(sheet) + delta);
  return setSheetFieldValue(sheet, 'endurance', next);
}

/**
 * Seed Endurance, Protection, and proficiency hint from a background selection.
 * Does not overwrite attribute dice the player already assigned.
 */
export function applyBackgroundToSheet(
  sheet: CharacterSheet,
  backgroundName: string,
): CharacterSheet {
  const bg = getMuscadinesBackground(backgroundName);
  if (!bg) return setSheetFieldValue(sheet, 'background', backgroundName);

  let next = setSheetFieldValue(sheet, 'background', bg.name);
  next = setSheetFieldValue(next, 'endurance', bg.endurance);
  next = setSheetFieldValue(next, 'protection', bg.protection);
  next = setSheetFieldValue(
    next,
    'proficiencies',
    bg.proficiencies.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' & '),
  );
  next = setSheetFieldValue(
    next,
    'abilities',
    bg.abilities.map((a) => `${a.name}: ${a.text}`).join('\n\n'),
  );
  return next;
}

/**
 * Lite challenge check (Creator Guide + Tips).
 * Total ≥ DR → +1 success toward RS; miss → setback (+1 card, optional DR+1).
 * Burning a card adds one impact d6 (caller must include those dice in `rolls`).
 */
export function resolveMuscadinesCheck(input: MuscadinesCheckInput): MuscadinesCheckResult {
  const cardsToBurn = Math.max(0, Math.min(input.cardsToBurn, input.handCards));
  const expectedDice = 1 + Math.max(0, input.impactDice) + cardsToBurn;
  const rolls = input.rolls.slice(0, expectedDice);
  while (rolls.length < expectedDice) rolls.push(1);

  const total = rolls.reduce((sum, n) => sum + n, 0);
  const success = total >= input.challengeDR;
  const setback = !success;
  let handCards = input.handCards - cardsToBurn;
  let challengeDR = input.challengeDR;
  let challengeSuccesses = input.challengeSuccesses;
  let successesGained = 0;

  if (success) {
    successesGained = 1;
    challengeSuccesses += 1;
  } else {
    handCards += 1;
    if (input.festivalMode) challengeDR += 1;
  }

  const challengeOvercome = challengeSuccesses >= input.challengeRS;
  const rollText = rolls.join('+');
  const outcome = success
    ? `Success (${total} ≥ DR ${input.challengeDR}) — ${challengeSuccesses}/${input.challengeRS} Resolve`
    : `Setback (${total} < DR ${input.challengeDR}) — gain 1 card (hand ${handCards})`;

  const summary = [
    `Check [${rollText}=${total}]`,
    cardsToBurn > 0 ? `burned ${cardsToBurn} card${cardsToBurn === 1 ? '' : 's'}` : null,
    outcome,
    challengeOvercome ? 'Challenge overcome!' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    total,
    rolls,
    success,
    setback,
    successesGained,
    challengeSuccesses,
    challengeOvercome,
    handCards,
    challengeDR,
    cardsBurned: cardsToBurn,
    summary,
  };
}

export function defaultChallengeState(): MuscadinesChallengeState {
  return {
    handCards: 0,
    challengeDR: 8,
    challengeRS: 2,
    challengeSuccesses: 0,
    challengeLabel: '',
    festivalMode: false,
  };
}

export function isMuscadinesAttribute(value: string): value is MuscadinesAttribute {
  return (MUSCADINES_ATTRIBUTES as readonly string[]).includes(value);
}
