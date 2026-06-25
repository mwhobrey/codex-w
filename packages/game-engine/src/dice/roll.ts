import { defaultRng, rollInt, type Rng } from '../rng';
import { formatDiceTerm, parseDiceNotation } from './parse';
import type {
  DiceGroupResult,
  DiceTerm,
  DieRoll,
  DieSides,
  KeepDropModifier,
  ParsedRoll,
  RollResult,
} from './types';

const FUDGE_VALUES = [-1, 0, 0, 1] as const;

export function rollParsed(parsed: ParsedRoll, rng: Rng = defaultRng): RollResult {
  const groups: DiceGroupResult[] = [];
  let modifierTotal = 0;

  for (const term of parsed.terms) {
    if (term.type === 'modifier') {
      modifierTotal += term.value;
      continue;
    }
    groups.push(rollDiceGroup(term, rng));
  }

  const diceTotal = groups.reduce((sum, group) => sum + group.subtotal, 0);

  return {
    notation: parsed.raw,
    groups,
    modifierTotal,
    total: diceTotal + modifierTotal,
    rolledAt: new Date().toISOString(),
  };
}

export function rollDiceNotation(notation: string, rng?: Rng): RollResult {
  return rollParsed(parseDiceNotation(notation), rng);
}

function rollDiceGroup(term: DiceTerm, rng: Rng): DiceGroupResult {
  const rolls: DieRoll[] = Array.from({ length: term.count }, () => ({
    value: rollSingleDie(term.sides, rng),
    sides: term.sides,
    kept: true,
  }));

  applyKeepDrop(rolls, term.keepDrop);

  return {
    notation: formatDiceTerm(term),
    sides: term.sides,
    rolls,
    subtotal: rolls.filter((die) => die.kept).reduce((sum, die) => sum + die.value, 0),
  };
}

function rollSingleDie(sides: DieSides, rng: Rng): number {
  if (sides === 'fudge') {
    const index = rollInt(0, FUDGE_VALUES.length - 1, rng);
    return FUDGE_VALUES[index]!;
  }
  if (sides === 'percent') {
    return rollInt(1, 100, rng);
  }
  return rollInt(1, sides, rng);
}

function applyKeepDrop(rolls: DieRoll[], modifier?: KeepDropModifier): void {
  if (!modifier) return;

  const indexed = rolls.map((roll, index) => ({ roll, index }));
  indexed.sort((a, b) => a.roll.value - b.roll.value);

  const keptIndices = new Set<number>();

  switch (modifier.kind) {
    case 'kh':
      indexed.slice(-modifier.count).forEach(({ index }) => keptIndices.add(index));
      break;
    case 'kl':
      indexed.slice(0, modifier.count).forEach(({ index }) => keptIndices.add(index));
      break;
    case 'dh':
      indexed.forEach(({ index }) => keptIndices.add(index));
      indexed.slice(-modifier.count).forEach(({ index }) => keptIndices.delete(index));
      break;
    case 'dl':
      indexed.forEach(({ index }) => keptIndices.add(index));
      indexed.slice(0, modifier.count).forEach(({ index }) => keptIndices.delete(index));
      break;
  }

  rolls.forEach((roll, index) => {
    roll.kept = keptIndices.has(index);
  });
}
