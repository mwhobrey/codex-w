import type { SheetDefinition } from '../types';
import {
  activityTable,
  campLeaderTable,
  decisionOracleTable,
  locationTable,
  mentorPrompts,
  mischiefTable,
  monsterMotiveTable,
  monsterTable,
  monstrousTable,
  motivationOptions,
  specialtyOptions,
  styleOptions,
} from './tables';

export const snallygasterSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'counselor',
      title: 'Counselor',
      description:
        'Murie is gone. Lead the campers, save them from themselves, survive what lurks. Skill = Style + Specialty mods (usually 2–5).',
      fields: [
        {
          key: 'camp_name',
          label: 'Camp name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Itchy, Mudbath…',
          description: 'Earned name — explain how you got it.',
        },
        {
          key: 'style',
          label: 'Style',
          type: 'select',
          defaultValue: '',
          options: styleOptions.map((s) => s.style),
          description: 'Grants an item and a Skill modifier.',
        },
        {
          key: 'specialty',
          label: 'Specialty',
          type: 'select',
          defaultValue: '',
          options: specialtyOptions.map((s) => s.specialty),
          description: 'Grants backpack items and a Skill modifier.',
        },
        {
          key: 'number',
          label: 'Skill',
          type: 'number',
          defaultValue: 3,
          description:
            'Sum of Style + Specialty mods (2–5). High = better Monster (under). Low = better Counselor (over). Exact = Monstrous Counselor.',
        },
        {
          key: 'backpack',
          label: 'Backpack',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Items from Style + Specialty…',
        },
        {
          key: 'motivation',
          label: 'Motivation',
          type: 'select',
          defaultValue: '',
          options: motivationOptions,
          description: 'Once per game: cheat death for you or your favorite camper (3d6).',
        },
      ],
    },
    {
      id: 'favorite_camper',
      title: 'Favorite camper',
      fields: [
        {
          key: 'camper_name',
          label: 'Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Their name',
        },
        {
          key: 'camper_why',
          label: 'Why are they at camp?',
          type: 'text',
          defaultValue: '',
        },
        {
          key: 'camper_struggle',
          label: 'What do they struggle with?',
          type: 'text',
          defaultValue: '',
        },
        {
          key: 'camper_loves',
          label: 'What do they love?',
          type: 'text',
          defaultValue: '',
        },
        {
          key: 'camper_secret',
          label: 'Deep secret',
          type: 'textarea',
          defaultValue: '',
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
          placeholder: 'Safe / dangerous locations, plot, camp traditions…',
        },
      ],
    },
  ],
};

/**
 * Solo engine — Camp Snallygaster (CC BY 4.0). Official tables from the book.
 * Solo loop: PATH over 5 days (Going It Alone).
 */
export const snallygasterSoloEngine = {
  kind: 'lasers-feelings' as const,
  scenePrompts: [
    'PATH — Pick a location. Safe for roleplay, dangerous for problems.',
    'Which two daily activities is your group doing?',
    'Telegraph a danger, then ask: what do you do?',
    'Huddle around the fire — what grisly result of negligence surfaces?',
    'Hard selfless choice, or easy monstrous one?',
    'What evidence of the monster’s recent effect on camp do you find?',
  ],
  lasersFeelings: {
    counselorLabel: 'Counselor',
    monsterLabel: 'Monster',
    problemTable: mischiefTable,
    activityTable,
    mischiefTable,
    monstrousTable,
    locationTable,
    monsterTable,
    campLeaderTable,
    monsterMotiveTable,
    decisionOracleTable,
  },
  twistTable: monsterMotiveTable,
  mentorPrompts,
};
