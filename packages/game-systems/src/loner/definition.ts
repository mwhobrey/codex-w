import type { SheetDefinition } from '../types';
import {
  lonerDicePresets,
  lonerRulesPrimer,
  lonerSceneMoodTable,
  lonerScenePrompts,
  lonerTwistActions,
  lonerTwistSubjects,
  lonerTwistTable,
} from './oracle-core';

/** Official Loner protagonist tags (CC BY-SA SRD). */
export const lonerSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Protagonist',
      description: 'Tags describe who you are — qualitative, not numeric.',
      fields: [
        {
          key: 'concept',
          label: 'Concept',
          type: 'text',
          defaultValue: '',
          placeholder: 'Adjective + role — Cynical Field Agent…',
        },
        {
          key: 'skill1',
          label: 'Skill 1',
          type: 'text',
          defaultValue: '',
          placeholder: 'A specific ability — not “Smart”',
        },
        {
          key: 'skill2',
          label: 'Skill 2',
          type: 'text',
          defaultValue: '',
          placeholder: 'A second specific ability',
        },
        {
          key: 'frailty',
          label: 'Frailty',
          type: 'text',
          defaultValue: '',
          placeholder: 'What gets in your way',
        },
      ],
    },
    {
      id: 'gear',
      title: 'Gear',
      description: 'Two notable items; everyday kit is assumed.',
      fields: [
        {
          key: 'gear1',
          label: 'Gear 1',
          type: 'text',
          defaultValue: '',
          placeholder: 'A particular piece of equipment',
        },
        {
          key: 'gear2',
          label: 'Gear 2',
          type: 'text',
          defaultValue: '',
          placeholder: 'A particular piece of equipment',
        },
      ],
    },
    {
      id: 'drives',
      title: 'Drives',
      description: 'What pulls you through the story.',
      fields: [
        {
          key: 'goal',
          label: 'Goal',
          type: 'text',
          defaultValue: '',
          placeholder: 'Long-term objective',
        },
        {
          key: 'motive',
          label: 'Motive',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Why the goal matters',
        },
        {
          key: 'nemesis',
          label: 'Nemesis',
          type: 'text',
          defaultValue: '',
          placeholder: 'Person or organization working against you',
        },
      ],
    },
    {
      id: 'luck',
      title: 'Luck',
      description: 'Used in Conflicts; starts and caps at 6; recharges when a conflict ends.',
      fields: [
        {
          key: 'luck',
          label: 'Luck',
          type: 'number',
          defaultValue: 6,
          description: '0–6. Harm reduces Luck; at 0 you lose the conflict.',
        },
      ],
    },
    {
      id: 'notes',
      title: 'Session Notes',
      fields: [
        {
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Conditions, scene tags, NPCs, threads…',
        },
      ],
    },
  ],
};

export const lonerSoloEngine = {
  kind: 'loner-oracle' as const,
  oracleDice: '1d6',
  riskDice: '1d6',
  scenePrompts: lonerScenePrompts,
  twistTable: lonerTwistTable,
  twistSubjects: lonerTwistSubjects,
  twistActions: lonerTwistActions,
  sceneMoodTable: lonerSceneMoodTable,
};

export { lonerDicePresets, lonerRulesPrimer };
