import type { CharacterSheet, GameSystemId } from '@codex/schemas';
import { getFieldValue } from './field-access';

/** System-agnostic identity — travels when a character crosses game systems */
export interface PortableProfile {
  name: string;
  tagline: string;
  summary: string;
  traits: string[];
  nemesis: string;
  notes: string;
}

const FIELD_ALIASES: Record<string, keyof PortableProfile | 'trait'> = {
  concept: 'tagline',
  given_name: 'tagline',
  goal: 'tagline',
  human_name: 'tagline',
  score: 'tagline',
  motive: 'summary',
  cozy_dark: 'summary',
  scars: 'summary',
  backstory: 'summary',
  verb: 'trait',
  role: 'trait',
  alias: 'trait',
  specialty: 'trait',
  crew_role: 'trait',
  jam_specialty: 'trait',
  grove: 'trait',
  nemesis: 'nemesis',
  fear: 'nemesis',
  iron_nemesis: 'nemesis',
  iron_oath: 'tagline',
  callsign: 'trait',
  district: 'trait',
  notes: 'notes',
  equipment: 'notes',
  contacts: 'notes',
  diary: 'notes',
  inventory: 'notes',
};

export function extractPortableProfile(sheet: CharacterSheet): PortableProfile {
  const profile: PortableProfile = {
    name: sheet.name,
    tagline: '',
    summary: '',
    traits: [],
    nemesis: '',
    notes: '',
  };

  for (const field of sheet.fields) {
    const value = getFieldValue(sheet, field.key);
    if (!value) continue;

    if (field.key.startsWith('custom:')) {
      const line = `${field.label}: ${value}`;
      profile.notes = profile.notes ? `${profile.notes}\n${line}` : line;
      continue;
    }

    const alias = FIELD_ALIASES[field.key];
    if (alias === 'trait') {
      profile.traits.push(`${field.label}: ${value}`);
    } else if (alias === 'tagline' && !profile.tagline) {
      profile.tagline = value;
    } else if (alias === 'summary') {
      profile.summary = profile.summary ? `${profile.summary}\n\n${value}` : value;
    } else if (alias === 'nemesis') {
      profile.nemesis = value;
    } else if (alias === 'notes') {
      profile.notes = profile.notes ? `${profile.notes}\n\n${value}` : value;
    }
  }

  return profile;
}

const TARGET_FIELD_MAP: Partial<
  Record<GameSystemId, Partial<Record<keyof PortableProfile, string>>>
> = {
  generic: {
    tagline: 'concept',
    summary: 'backstory',
    nemesis: 'notes',
    notes: 'notes',
  },
  loner: {
    tagline: 'goal',
    summary: 'motive',
    nemesis: 'nemesis',
    notes: 'notes',
  },
  totv: {
    tagline: 'human_name',
    summary: 'diary',
    notes: 'diary',
  },
  snallygaster: {
    tagline: 'fear',
    summary: 'secret',
    nemesis: 'notes',
    notes: 'notes',
  },
  muscadines: {
    tagline: 'jam_specialty',
    summary: 'cozy_dark',
    notes: 'notes',
  },
  ironforge: {
    tagline: 'iron_oath',
    summary: 'scars',
    nemesis: 'iron_nemesis',
    notes: 'notes',
  },
};

export function adaptSheetToSystem(
  source: CharacterSheet,
  createEmpty: (name: string, ownerId: string) => CharacterSheet,
  targetSystemId: GameSystemId,
): CharacterSheet {
  const mappings = proposeFieldMappings(source, targetSystemId, createEmpty);
  return adaptSheetWithMappings(source, createEmpty, targetSystemId, mappings);
}

export type AdaptTargetSelection = string | 'skip';

export interface FieldAdaptMapping {
  sourceKey: string;
  sourceLabel: string;
  sourceValue: string;
  targetKey: AdaptTargetSelection;
}

export interface TargetFieldOption {
  key: string;
  label: string;
  section: string;
}

export function listTargetFieldOptions(
  createEmpty: (name: string, ownerId: string) => CharacterSheet,
): TargetFieldOption[] {
  const scaffold = createEmpty('__scaffold__', '__owner__');
  return scaffold.fields.map((field) => ({
    key: field.key,
    label: field.label,
    section: 'Sheet',
  }));
}

function suggestTargetKey(
  source: CharacterSheet,
  field: CharacterSheet['fields'][number],
  targetSystemId: GameSystemId,
  targetKeys: Set<string>,
): AdaptTargetSelection {
  if (field.key.startsWith('custom:')) {
    if (targetKeys.has('notes')) return 'notes';
    const notesLike = [...targetKeys].find((k) => k.includes('note') || k.includes('diary'));
    return notesLike ?? 'skip';
  }

  if (targetKeys.has(field.key)) return field.key;

  const alias = FIELD_ALIASES[field.key];
  if (alias) {
    const mapping = TARGET_FIELD_MAP[targetSystemId] ?? TARGET_FIELD_MAP.generic!;
    if (alias === 'trait') {
      if (targetKeys.has(field.key)) return field.key;
      if (targetSystemId === 'loner') {
        if (field.key === 'verb' && targetKeys.has('verb')) return 'verb';
        if (field.key === 'role' && targetKeys.has('role')) return 'role';
      }
      return 'skip';
    }
    const mapped = mapping[alias as keyof typeof mapping];
    if (mapped && targetKeys.has(mapped)) return mapped;
  }

  return 'skip';
}

export function proposeFieldMappings(
  source: CharacterSheet,
  targetSystemId: GameSystemId,
  createEmpty: (name: string, ownerId: string) => CharacterSheet,
): FieldAdaptMapping[] {
  const options = listTargetFieldOptions(createEmpty);
  const targetKeys = new Set(options.map((o) => o.key));

  return source.fields.map((field) => ({
    sourceKey: field.key,
    sourceLabel: field.label,
    sourceValue: getFieldValue(source, field.key),
    targetKey: suggestTargetKey(source, field, targetSystemId, targetKeys),
  }));
}

export function adaptSheetWithMappings(
  source: CharacterSheet,
  createEmpty: (name: string, ownerId: string) => CharacterSheet,
  targetSystemId: GameSystemId,
  mappings: FieldAdaptMapping[],
): CharacterSheet {
  const profile = extractPortableProfile(source);
  const now = new Date().toISOString();
  const base = createEmpty(profile.name || source.name, source.ownerId);

  const valuesByTarget = new Map<string, string[]>();

  for (const mapping of mappings) {
    if (mapping.targetKey === 'skip') continue;
    const value = mapping.sourceValue.trim();
    if (!value) continue;
    const existing = valuesByTarget.get(mapping.targetKey) ?? [];
    existing.push(value);
    valuesByTarget.set(mapping.targetKey, existing);
  }

  const fields = base.fields.map((field) => {
    const injected = valuesByTarget.get(field.key);
    if (!injected?.length) return field;
    if (field.type === 'list') {
      return { ...field, value: injected.flatMap((line) => line.split(/,\s*/)).filter(Boolean) };
    }
    return { ...field, value: injected.join('\n\n') };
  });

  return {
    ...base,
    gameSystemId: targetSystemId,
    originSystemId: source.originSystemId ?? (source.gameSystemId as GameSystemId),
    lineageSheetId: source.id,
    fields,
    createdAt: now,
    updatedAt: now,
  };
}

export interface MoveSheetResult {
  archive: CharacterSheet;
  moved: CharacterSheet;
}

/** Move in place — archives the current sheet for walk-back via lineage. */
export function moveSheetWithMappings(
  source: CharacterSheet,
  createEmpty: (name: string, ownerId: string) => CharacterSheet,
  targetSystemId: GameSystemId,
  mappings: FieldAdaptMapping[],
): MoveSheetResult {
  const now = new Date().toISOString();
  const archive: CharacterSheet = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (before move)`,
    lineageSheetId: source.lineageSheetId,
    createdAt: now,
    updatedAt: now,
  };

  const adapted = adaptSheetWithMappings(source, createEmpty, targetSystemId, mappings);
  const moved: CharacterSheet = {
    ...adapted,
    id: source.id,
    createdAt: source.createdAt,
    lineageSheetId: archive.id,
    originSystemId: source.originSystemId ?? (source.gameSystemId as GameSystemId),
  };

  return { archive, moved };
}
