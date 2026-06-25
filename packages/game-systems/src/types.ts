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
  createEmptySheet: (name: string, ownerId: string) => CharacterSheet;
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
  | 'prompt-journal'
  | 'lasers-feelings'
  | 'mentor'
  | 'vow-progress';

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

export interface SoloEngineConfig {
  kind: SoloEngineKind;
  scenePrompts: string[];
  /** Oracle + mentor modes */
  oracleLikelihoods?: OracleLikelihood[];
  twistTable?: OracleTableEntry[];
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
  };
  /** Midnight Muscadines — directed solo guidance */
  mentorPrompts?: MentorPrompt[];
  folkloreTables?: {
    groveOmens?: OracleTableEntry[];
    jarResults?: OracleTableEntry[];
  };
  /** Ironforge — grim industrial vow progress */
  vowProgress?: {
    progressMax: number;
    difficulties: { id: string; label: string; target: number }[];
    complicationTable: OracleTableEntry[];
    hazardTable: OracleTableEntry[];
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
