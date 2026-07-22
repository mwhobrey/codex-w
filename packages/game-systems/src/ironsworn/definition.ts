import type { SheetDefinition } from '../types';
import { ironswornOracleCatalog } from './oracles';
import { ironswornCoreMoves } from './moves';
import { ironswornAssets } from './assets';

export const ironswornSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Ironsworn',
      description:
        'A sworn wanderer of the Ironlands. Stats are Edge, Heart, Iron, Shadow, and Wits (typically 3, 2, 2, 1, 1).',
      fields: [
        {
          key: 'background',
          label: 'Background',
          type: 'text',
          defaultValue: '',
          placeholder: 'Who were you before the vow?',
        },
        {
          key: 'iron_vow',
          label: 'Background vow',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'The iron vow that sets your journey in motion',
        },
      ],
    },
    {
      id: 'stats',
      title: 'Stats',
      fields: [
        { key: 'edge', label: 'Edge', type: 'number', defaultValue: 2, description: 'Speed, agility, finesse (0–5)' },
        { key: 'heart', label: 'Heart', type: 'number', defaultValue: 2, description: 'Courage, willpower, empathy' },
        { key: 'iron', label: 'Iron', type: 'number', defaultValue: 2, description: 'Strength, endurance, aggression' },
        { key: 'shadow', label: 'Shadow', type: 'number', defaultValue: 1, description: 'Sneak, deceit, cunning' },
        { key: 'wits', label: 'Wits', type: 'number', defaultValue: 1, description: 'Knowledge, observation, expertise' },
      ],
    },
    {
      id: 'meters',
      title: 'Status',
      fields: [
        {
          key: 'momentum',
          label: 'Momentum',
          type: 'number',
          defaultValue: 2,
          description: '−6 to +10. Burn to cancel challenge dice under your momentum.',
        },
        {
          key: 'momentum_reset',
          label: 'Momentum reset',
          type: 'number',
          defaultValue: 2,
          description: 'Value after burning momentum (usually +2; assets may change it).',
        },
        { key: 'health', label: 'Health', type: 'number', defaultValue: 5, description: '0–5' },
        { key: 'spirit', label: 'Spirit', type: 'number', defaultValue: 5, description: '0–5' },
        { key: 'supply', label: 'Supply', type: 'number', defaultValue: 5, description: 'Shared party resource, 0–5' },
      ],
    },
    {
      id: 'bonds',
      title: 'Bonds',
      fields: [
        {
          key: 'bonds',
          label: 'Bonds',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'People, communities, and places you are bound to',
        },
      ],
    },
    {
      id: 'assets',
      title: 'Assets',
      fields: [
        {
          key: 'asset_ids',
          label: 'Asset ids',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Comma-separated asset ids from the catalog (e.g. path-herbalist, companion-hound)',
          description: 'Select from the Ironsworn asset catalog on the play panel.',
        },
        {
          key: 'asset_notes',
          label: 'Asset notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Abilities enabled, companion health, options…',
        },
      ],
    },
    {
      id: 'notes',
      title: 'Notes',
      fields: [
        {
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Debilities, XP, world truths…',
        },
      ],
    },
  ],
};

export const ironswornRulesPrimer: string[] = [
  'Action roll: 1d6 + a stat (+ adds) vs two challenge dice (2d10). Beat both = strong hit; one = weak hit; none = miss. Matching challenge dice is an opportunity or twist.',
  'Burn momentum after a roll to cancel any challenge die lower than your current momentum, then reset momentum.',
  'Vows use a 10-box progress track. Mark progress by rank (troublesome marks faster than epic). Fulfill Your Vow with a progress roll (progress score vs 2d10).',
  'Oracles (Action + Theme, and others) answer questions when you Ask the Oracle. Interpret results into the fiction.',
  'This module uses Ironsworn open content (CC BY 4.0). Codex is not an official Ironsworn product.',
];

export const ironswornDicePresets = [
  { label: 'Action die', notation: '1d6' },
  { label: 'Challenge', notation: '2d10' },
  { label: 'Oracle', notation: '1d100' },
];

export const ironswornSoloEngine = {
  kind: 'ironsworn' as const,
  scenePrompts: [
    'What iron vow still pulls you forward?',
    'What threat waits beyond the next hill or hearth?',
    'Who depends on your word — and who doubts it?',
    'What scarce resource is running low?',
    'What rumor of the Ironlands demands an answer?',
  ],
  oracleDice: '1d6',
  riskDice: '1d6',
  oracleLikelihoods: [
    { id: 'impossible' as const, label: 'Almost certain no', threshold: 1, description: 'Yes only on a 1' },
    { id: 'unlikely' as const, label: 'Unlikely', threshold: 2, description: 'Yes on 1–2' },
    { id: 'even' as const, label: '50/50', threshold: 3, description: 'Yes on 1–3' },
    { id: 'likely' as const, label: 'Likely', threshold: 4, description: 'Yes on 1–4' },
    { id: 'certain' as const, label: 'Almost certain', threshold: 5, description: 'Yes on 1–5' },
  ],
  twistTable: [
    { roll: 1, text: 'A new danger appears or an existing one escalates' },
    { roll: 2, text: 'An ally or bond is put at risk' },
    { roll: 3, text: 'A resource or advantage you relied on is lost' },
    { roll: 4, text: 'You are separated from your goal or companions' },
    { roll: 5, text: 'A secret or truth is revealed at the worst time' },
    { roll: 6, text: 'Your vow becomes more costly — or more personal' },
  ],
  ironsworn: {
    moves: ironswornCoreMoves,
    oracles: ironswornOracleCatalog,
    assets: ironswornAssets,
  },
};
