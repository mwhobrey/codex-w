import type { SheetDefinition } from '../types';
import { backgroundNameOptions, muscadinesBackgrounds } from './backgrounds';
import {
  folkOptions,
  guildOptions,
  mentorPrompts,
  MUSCADINES_DIE_RATINGS,
  quirkOptions,
  quirkTable,
  startingItemTable,
  styleOptions,
  styleTable,
} from './tables';

const dieOptions = [...MUSCADINES_DIE_RATINGS];

export const muscadinesSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Marmateer',
      description:
        'Midnight Muscadines — folk, background, guild, style, and quirk. Assign attribute dice (d4, d4, d6, d8), then step up background proficiencies.',
      fields: [
        {
          key: 'given_name',
          label: 'Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'What do people call you?',
        },
        {
          key: 'pronouns',
          label: 'Pronouns',
          type: 'text',
          defaultValue: '',
          placeholder: 'they/them',
        },
        {
          key: 'folk',
          label: 'Folk',
          type: 'select',
          defaultValue: '',
          options: [...folkOptions],
          description: 'Playable folk from the Setting Guide.',
        },
        {
          key: 'background',
          label: 'Background',
          type: 'select',
          defaultValue: '',
          options: backgroundNameOptions,
          description: 'Grants Endurance, Protection, proficiencies, and starting abilities.',
        },
        {
          key: 'guild',
          label: 'Guild',
          type: 'select',
          defaultValue: '',
          options: [...guildOptions],
        },
        {
          key: 'style',
          label: 'Style',
          type: 'select',
          defaultValue: '',
          options: styleOptions.map((s) => s.name),
        },
        {
          key: 'quirk',
          label: 'Quirk',
          type: 'select',
          defaultValue: '',
          options: quirkOptions.map((q) => q.name),
        },
      ],
    },
    {
      id: 'attributes',
      title: 'Attributes & resilience',
      fields: [
        {
          key: 'strength',
          label: 'Strength',
          type: 'select',
          defaultValue: 'd6',
          options: dieOptions,
        },
        {
          key: 'dexterity',
          label: 'Dexterity',
          type: 'select',
          defaultValue: 'd6',
          options: dieOptions,
        },
        {
          key: 'willpower',
          label: 'Willpower',
          type: 'select',
          defaultValue: 'd6',
          options: dieOptions,
        },
        {
          key: 'heart',
          label: 'Heart',
          type: 'select',
          defaultValue: 'd6',
          options: dieOptions,
        },
        {
          key: 'proficiencies',
          label: 'Proficiencies',
          type: 'text',
          defaultValue: '',
          placeholder: 'Filled from background…',
          description: 'Background proficient attributes (step these dice up one rating).',
        },
        {
          key: 'endurance',
          label: 'Endurance',
          type: 'number',
          defaultValue: 6,
          description: 'Resilience. At 0, the adversary’s goal lands narratively — low lethality.',
        },
        {
          key: 'protection',
          label: 'Protection',
          type: 'select',
          defaultValue: '1d6',
          options: ['—', '1d4', '1d6', '1d8', '1d10'],
        },
        {
          key: 'abilities',
          label: 'Abilities',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Folk + background abilities…',
        },
      ],
    },
    {
      id: 'jam_craft',
      title: 'Jar & pantry',
      fields: [
        {
          key: 'jar_description',
          label: "Marmateer's jar",
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Describe, sketch, or note your magical jam jar…',
        },
        {
          key: 'pouch_ingredients',
          label: 'Ingredient pouch',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Ingredients gathered for jam (name + notes)…',
        },
        {
          key: 'jar_spells',
          label: 'Jam spells',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Ingredients in the jar and how their effects meld…',
        },
        {
          key: 'inventory_item',
          label: 'Starting item',
          type: 'text',
          defaultValue: '',
          placeholder: 'One d6 item from chargen…',
        },
        {
          key: 'inventory',
          label: 'Inventory',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Gear, favors, tokens of renown…',
        },
      ],
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: [
        {
          key: 'notes',
          label: 'Session notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Rumors, guild favors, Wildernight landmarks…',
        },
      ],
    },
  ],
};

/**
 * Solo engine — Midnight Muscadines (CC BY-SA).
 * Challenge resolution is a lite play aid; full card/feat/ingredient rules need the book / future SRD.
 */
export const muscadinesSoloEngine = {
  kind: 'mentor' as const,
  oracleDice: '1d6',
  riskDice: '2d6',
  oracleLikelihoods: [
    { id: 'impossible' as const, label: 'No way', threshold: 1, description: 'Yes only on a 1' },
    { id: 'unlikely' as const, label: 'Unlikely', threshold: 2, description: 'Yes on 1–2' },
    { id: 'even' as const, label: '50/50', threshold: 3, description: 'Yes on 1–3' },
    { id: 'likely' as const, label: 'Likely', threshold: 4, description: 'Yes on 1–4' },
    { id: 'certain' as const, label: 'Almost certain', threshold: 5, description: 'Yes on 1–5' },
  ],
  scenePrompts: [
    'Where are you — under a sun-shard beacon in Nimm, or past the twilight edge into the Wildernight?',
    'What rumor of midnight muscadines (or overflowing magic) pulled you onto the road?',
    'Who needs a jar, a favor, or a quiet meal before the next trek?',
    'What guild agenda brushes against your cozy plans?',
    'What Soft danger is telegraphed — and how do you prepare?',
    'Is there a festival, shop, or countryside pause before the harvest?',
  ],
  mentorPrompts,
  folkloreTables: {
    // Codex play-aid flavor (not book tables) — labeled in library as such
    groveOmens: [
      { roll: 1, text: '[Codex] Lantern moths spiral toward a jar that is not yet sealed' },
      { roll: 2, text: '[Codex] A neighbor leaves three empty jars and a worried note' },
      { roll: 3, text: '[Codex] Beacon light flickers once — every marmateer looks up' },
      { roll: 4, text: '[Codex] Wildernight mist tastes faintly of crushed grapes' },
      { roll: 5, text: '[Codex] A guild sigil appears chalked where none was yesterday' },
      { roll: 6, text: '[Codex] Something small and luminous watches from the treeline' },
    ],
    jarResults: [
      { roll: 1, text: '[Codex] Comfort — grief softens for one honest night' },
      { roll: 2, text: '[Codex] Truth — someone speaks what they hid' },
      { roll: 3, text: '[Codex] Binding — quarreling neighbors must share a meal' },
      { roll: 4, text: '[Codex] Warning — the eater dreams of teeth in the dark' },
      { roll: 5, text: '[Codex] Memory — a forgotten name returns bitter-sweet' },
      { roll: 6, text: '[Codex] Unintended — the magic works on the wrong person' },
    ],
  },
  muscadines: {
    styles: styleTable(),
    quirks: quirkTable(),
    startingItems: startingItemTable(),
    backgrounds: muscadinesBackgrounds.map((bg, index) => ({
      roll: index + 1,
      text: `${bg.name} — ${bg.proficiencies.join(' & ')}; Endurance ${bg.endurance}; Protection ${bg.protection}. ${bg.summary}`,
    })),
    defaultChallengeDR: 8,
    defaultChallengeRS: 2,
  },
};
