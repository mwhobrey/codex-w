import type { CharacterSheet, CharacterSheetField, GameSystemId } from '@codex/schemas';

export type SheetFieldType = CharacterSheetField['type'];

export interface SheetFieldDefinition {
  key: string;
  label: string;
  type: SheetFieldType;
  defaultValue: string | number | boolean | string[];
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface SheetSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: SheetFieldDefinition[];
}

export interface SheetDefinition {
  sections: SheetSectionDefinition[];
}

export interface GameSystemPlugin {
  id: GameSystemId;
  name: string;
  tagline: string;
  sheetDefinition: SheetDefinition;
  soloEngine?: SoloEngineConfig;
  /** Quick-roll presets for play table dice UI */
  dicePresets?: DicePreset[];
  /**
   * Short bullet points explaining what the table panel's buttons/mechanics
   * do — shown as a collapsed "How this works" primer for cold-start solo
   * players who don't have a GM to ask.
   */
  rulesPrimer?: string[];
  createEmptySheet: (name: string, ownerId: string) => CharacterSheet;
}

export interface DicePreset {
  label: string;
  notation: string;
}

export type OracleLikelihoodId =
  | 'impossible'
  | 'unlikely'
  | 'even'
  | 'likely'
  | 'certain';

export interface OracleLikelihood {
  id: OracleLikelihoodId;
  label: string;
  threshold: number;
  description: string;
}

export interface OracleTableEntry {
  roll: number;
  text: string;
}

export type SoloEngineKind =
  | 'oracle'
  | 'loner-oracle'
  | 'prompt-journal'
  | 'lasers-feelings'
  | 'mentor'
  | 'ironsworn';

export interface PromptEntry {
  id: number;
  text: string;
  tags?: string[];
  /** Play-surface hint — original guidance, not copyrighted prompt text */
  hint?: string;
}

export interface MentorPrompt {
  id: string;
  label: string;
  text: string;
}

/** Paranormal Files — Unknown Threshold delta from an Oracle label */
export interface UnknownThresholdDelta {
  label: string;
  description: string;
  delta: number;
}

export interface FactionDefinition {
  id: string;
  name: string;
  concept: string;
}

export interface SoloEngineConfig {
  kind: SoloEngineKind;
  scenePrompts: string[];
  /** Generic Mythic-style likelihood oracle */
  oracleLikelihoods?: OracleLikelihood[];
  twistTable?: OracleTableEntry[];
  /** Loner SRD — separate subject / action columns for 2d6 twists */
  twistSubjects?: OracleTableEntry[];
  twistActions?: OracleTableEntry[];
  sceneMoodTable?: OracleTableEntry[];
  oracleDice?: string;
  riskDice?: string;
  /** Thousand Year Old Vampire — d10 minus d6 prompt navigation */
  promptAdvance?: { minPrompt: number; maxPrompt: number };
  prompts?: PromptEntry[];
  /** Camp Snallygaster — Lasers & Feelings */
  lasersFeelings?: {
    counselorLabel: string;
    monsterLabel: string;
    problemTable: OracleTableEntry[];
    activityTable?: OracleTableEntry[];
    mischiefTable?: OracleTableEntry[];
    monstrousTable?: OracleTableEntry[];
    locationTable?: OracleTableEntry[];
    monsterTable?: OracleTableEntry[];
    campLeaderTable?: OracleTableEntry[];
    monsterMotiveTable?: OracleTableEntry[];
    decisionOracleTable?: OracleTableEntry[];
  };
  /** Midnight Muscadines — directed solo guidance */
  mentorPrompts?: MentorPrompt[];
  folkloreTables?: {
    groveOmens?: OracleTableEntry[];
    jarResults?: OracleTableEntry[];
  };
  /** Ironsworn — action rolls, vows, oracles, assets (CC BY) */
  ironsworn?: {
    moves: Array<{
      id: string;
      name: string;
      category: string;
      stats: string[];
      trigger: string;
      strong: string;
      weak: string;
      miss: string;
    }>;
    oracles: Array<{
      id: string;
      title: string;
      kind: 'd100' | 'range';
      rows: Array<{
        roll?: number;
        min?: number;
        max?: number;
        text: string;
      }>;
    }>;
    assets: Array<{
      id: string;
      name: string;
      type: string;
      summary: string;
      abilities: Array<{ id: string; text: string; starting?: boolean }>;
    }>;
  };
  /** Loner: Paranormal Files — Operating in the Shadows */
  paranormalFiles?: {
    unknownThresholdMax: number;
    thresholdDeltas: UnknownThresholdDelta[];
    realityFractureTable: OracleTableEntry[];
    factions: FactionDefinition[];
  };
}

export function fieldsFromDefinition(definition: SheetDefinition): CharacterSheetField[] {
  return definition.sections.flatMap((section) =>
    section.fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      value: field.defaultValue,
      options: field.options,
    })),
  );
}

export function createSheetFromDefinition(
  definition: SheetDefinition,
  params: {
    id: string;
    name: string;
    gameSystemId: GameSystemId;
    ownerId: string;
    originSystemId?: GameSystemId;
    lineageSheetId?: string;
    createdAt: string;
    updatedAt: string;
  },
): CharacterSheet {
  return {
    id: params.id,
    name: params.name,
    gameSystemId: params.gameSystemId,
    ownerId: params.ownerId,
    originSystemId: params.originSystemId ?? params.gameSystemId,
    lineageSheetId: params.lineageSheetId,
    fields: fieldsFromDefinition(definition),
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
  };
}

export function updateSheetField(
  sheet: CharacterSheet,
  key: string,
  value: string | number | boolean | string[],
): CharacterSheet {
  return {
    ...sheet,
    fields: sheet.fields.map((field) => (field.key === key ? { ...field, value } : field)),
    updatedAt: new Date().toISOString(),
  };
}

export function renameSheet(sheet: CharacterSheet, name: string): CharacterSheet {
  return {
    ...sheet,
    name,
    updatedAt: new Date().toISOString(),
  };
}
