import type { DiceTerm, KeepDropKind, KeepDropModifier, ParsedRoll, ParsedTerm } from './types';

export class DiceParseError extends Error {
  constructor(
    message: string,
    public readonly notation: string,
  ) {
    super(message);
    this.name = 'DiceParseError';
  }
}

const DICE_TERM =
  /^([+-]?)(\d*)d(%|\d+|[fF])((?:kh|kl|dh|dl)\d+)?(adv|disadv|dis)?$/i;
const MODIFIER_TERM = /^([+-]?)(\d+)$/;

export function parseDiceNotation(input: string): ParsedRoll {
  const raw = input.trim();
  if (!raw) {
    throw new DiceParseError('Notation cannot be empty', input);
  }

  const normalized = raw.replace(/\s+/g, '');
  const chunks = splitExpression(normalized);
  const terms: ParsedTerm[] = [];

  for (const chunk of chunks) {
    const diceMatch = chunk.match(DICE_TERM);
    if (diceMatch) {
      terms.push(parseDiceTerm(diceMatch, raw));
      continue;
    }

    const modMatch = chunk.match(MODIFIER_TERM);
    if (modMatch) {
      terms.push(parseModifierTerm(modMatch));
      continue;
    }

    throw new DiceParseError(`Invalid term "${chunk}"`, raw);
  }

  if (terms.length === 0) {
    throw new DiceParseError('No valid dice terms found', raw);
  }

  return { raw, terms };
}

function splitExpression(input: string): string[] {
  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;
    if ((char === '+' || char === '-') && current.length > 0) {
      chunks.push(current);
      current = char;
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

function parseModifierTerm(match: RegExpMatchArray): ParsedTerm {
  const sign = match[1] === '-' ? -1 : 1;
  const value = parseInt(match[2]!, 10);
  return { type: 'modifier', value: sign * value };
}

function parseDiceTerm(match: RegExpMatchArray, raw: string): DiceTerm {
  const sign = match[1] === '-' ? -1 : 1;
  const count = match[2] ? parseInt(match[2], 10) : 1;
  const sidesToken = match[3]!.toLowerCase();
  const keepDropToken = match[4];
  const advantageToken = match[5]?.toLowerCase();

  if (count < 1) {
    throw new DiceParseError('Dice count must be at least 1', raw);
  }

  const sides = parseSides(sidesToken, raw);
  let resolvedCount = count;
  let keepDrop = keepDropToken ? parseKeepDrop(keepDropToken, raw) : undefined;

  if (advantageToken) {
    if (sides !== 20) {
      throw new DiceParseError('Advantage/disadvantage only applies to d20 rolls', raw);
    }
    resolvedCount = Math.max(resolvedCount, 2);
    if (advantageToken === 'adv') {
      keepDrop = { kind: 'kh', count: 1 };
    } else {
      keepDrop = { kind: 'kl', count: 1 };
    }
  }

  const term: DiceTerm = {
    type: 'dice',
    count: resolvedCount,
    sides,
    keepDrop,
  };

  if (sign < 0) {
    throw new DiceParseError('Negative dice groups are not supported', raw);
  }

  return term;
}

function parseSides(token: string, raw: string): DiceTerm['sides'] {
  if (token === '%') return 'percent';
  if (token === 'f') return 'fudge';
  const sides = parseInt(token, 10);
  if (sides < 2) {
    throw new DiceParseError('Dice must have at least 2 sides', raw);
  }
  return sides;
}

function parseKeepDrop(token: string, raw: string): KeepDropModifier {
  const kind = token.slice(0, 2).toLowerCase() as KeepDropKind;
  const count = parseInt(token.slice(2), 10);

  if (!['kh', 'kl', 'dh', 'dl'].includes(kind)) {
    throw new DiceParseError(`Unknown keep/drop modifier "${token}"`, raw);
  }
  if (count < 1) {
    throw new DiceParseError('Keep/drop count must be at least 1', raw);
  }

  return { kind, count };
}

export function formatDiceTerm(term: DiceTerm): string {
  const sides =
    term.sides === 'percent' ? '%' : term.sides === 'fudge' ? 'F' : String(term.sides);
  const base = `${term.count}d${sides}`;
  if (!term.keepDrop) return base;
  return `${base}${term.keepDrop.kind}${term.keepDrop.count}`;
}
