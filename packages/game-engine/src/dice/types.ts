export type KeepDropKind = 'kh' | 'kl' | 'dh' | 'dl';

export interface KeepDropModifier {
  kind: KeepDropKind;
  count: number;
}

export type DieSides = number | 'fudge' | 'percent';

export interface DiceTerm {
  type: 'dice';
  count: number;
  sides: DieSides;
  keepDrop?: KeepDropModifier;
}

export interface ModifierTerm {
  type: 'modifier';
  value: number;
}

export type ParsedTerm = DiceTerm | ModifierTerm;

export interface ParsedRoll {
  raw: string;
  terms: ParsedTerm[];
}

export interface DieRoll {
  value: number;
  sides: DieSides;
  kept: boolean;
}

export interface DiceGroupResult {
  notation: string;
  sides: DieSides;
  rolls: DieRoll[];
  subtotal: number;
}

export interface RollResult {
  notation: string;
  groups: DiceGroupResult[];
  modifierTotal: number;
  total: number;
  rolledAt: string;
}
