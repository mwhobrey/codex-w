import type { CharacterSheet } from '@codex/schemas';
import { getSheetFieldValue } from './field-access';
import { extractPortableProfile } from './portable';
import { normalizeGameSystemId } from './registry';

export interface CharacterPeekSummary {
  headlineLabel: string;
  headline: string;
  summary: string;
  /** Extra labeled rows under the summary */
  details: Array<{ label: string; value: string; fieldKey: string }>;
}

/**
 * System-aware peek fields for play sidebar / character drawer.
 * Prefer this over branching on gameSystemId in React components.
 */
export function getCharacterPeekSummary(character: CharacterSheet): CharacterPeekSummary {
  const systemId = normalizeGameSystemId(character.gameSystemId);
  const profile = extractPortableProfile(character);
  const details: CharacterPeekSummary['details'] = [];

  const push = (label: string, fieldKey: string, value: string | undefined) => {
    if (value) details.push({ label, value, fieldKey });
  };

  switch (systemId) {
    case 'totv': {
      const vampireName = getSheetFieldValue(character, 'vampire_name');
      const humanName = getSheetFieldValue(character, 'human_name');
      return {
        headlineLabel: 'Identity',
        headline: vampireName || humanName || profile.tagline || character.name,
        summary: getSheetFieldValue(character, 'diary') || profile.summary || '',
        details,
      };
    }
    case 'ironsworn': {
      const vow = getSheetFieldValue(character, 'iron_vow');
      return {
        headlineLabel: 'Vow',
        headline: vow || profile.tagline || character.name,
        summary: getSheetFieldValue(character, 'background') || profile.summary || '',
        details,
      };
    }
    case 'snallygaster': {
      const motivation = getSheetFieldValue(character, 'motivation');
      const campName = getSheetFieldValue(character, 'camp_name');
      const fear = getSheetFieldValue(character, 'fear');
      push('Number', 'number', getSheetFieldValue(character, 'number'));
      push('Camp', 'camp_name', campName);
      push('Motivation', 'motivation', motivation);
      return {
        headlineLabel: motivation ? 'Motivation' : 'Camp name',
        headline: motivation || campName || fear || profile.tagline || character.name,
        summary:
          getSheetFieldValue(character, 'style') ||
          getSheetFieldValue(character, 'camper_secret') ||
          profile.summary ||
          '',
        details,
      };
    }
    case 'muscadines': {
      const style = getSheetFieldValue(character, 'style');
      const background = getSheetFieldValue(character, 'background');
      const jar = getSheetFieldValue(character, 'jar_description');
      push('Grove', 'grove', getSheetFieldValue(character, 'grove'));
      push('Specialty', 'jam_specialty', getSheetFieldValue(character, 'jam_specialty'));
      return {
        headlineLabel: style ? 'Style' : 'Background',
        headline:
          style ||
          background ||
          getSheetFieldValue(character, 'jam_specialty') ||
          getSheetFieldValue(character, 'grove') ||
          profile.tagline ||
          character.name,
        summary:
          jar ||
          getSheetFieldValue(character, 'jar_spells') ||
          getSheetFieldValue(character, 'cozy_dark') ||
          profile.summary ||
          '',
        details,
      };
    }
    case 'loner':
    case 'paranormal-files': {
      const concept = getSheetFieldValue(character, 'concept');
      const goal = getSheetFieldValue(character, 'goal');
      push('Luck', 'luck', getSheetFieldValue(character, 'luck'));
      push('Motive', 'motive', getSheetFieldValue(character, 'motive'));
      push('Nemesis', 'nemesis', getSheetFieldValue(character, 'nemesis'));
      return {
        headlineLabel: 'Concept',
        headline: concept || goal || profile.tagline || character.name,
        summary: getSheetFieldValue(character, 'motive') || profile.summary || '',
        details,
      };
    }
    default: {
      const goal = getSheetFieldValue(character, 'goal');
      push('Motive', 'motive', getSheetFieldValue(character, 'motive'));
      return {
        headlineLabel: 'Goal',
        headline: goal || profile.tagline || character.name,
        summary: getSheetFieldValue(character, 'motive') || profile.summary || '',
        details,
      };
    }
  }
}
