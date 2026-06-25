import type { SheetDefinition } from '../types';

export const lonerSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Character',
      description: 'The core of who you are in this story.',
      fields: [
        {
          key: 'verb',
          label: 'Verb',
          type: 'text',
          defaultValue: '',
          placeholder: 'How you solve problems — sneak, fight, charm…',
        },
        {
          key: 'role',
          label: 'Role',
          type: 'text',
          defaultValue: '',
          placeholder: 'Your place in the world — detective, exile, heir…',
        },
      ],
    },
    {
      id: 'drives',
      title: 'Drives',
      description: 'What pulls you through the session.',
      fields: [
        {
          key: 'goal',
          label: 'Goal',
          type: 'text',
          defaultValue: '',
          placeholder: 'What you want to achieve right now',
        },
        {
          key: 'motive',
          label: 'Motive',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Why it matters to you',
        },
        {
          key: 'nemesis',
          label: 'Nemesis',
          type: 'text',
          defaultValue: '',
          placeholder: 'The force working against you',
        },
      ],
    },
    {
      id: 'gear',
      title: 'Gear',
      fields: [
        {
          key: 'gear1',
          label: 'Gear 1',
          type: 'text',
          defaultValue: '',
          placeholder: 'A useful item',
        },
        {
          key: 'gear2',
          label: 'Gear 2',
          type: 'text',
          defaultValue: '',
          placeholder: 'A useful item',
        },
        {
          key: 'gear3',
          label: 'Gear 3',
          type: 'text',
          defaultValue: '',
          placeholder: 'A useful item',
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
          placeholder: 'Facts, NPCs, threads to follow…',
        },
      ],
    },
  ],
};

export const lonerSoloEngine = {
  kind: 'oracle' as const,
  oracleDice: '1d6',
  riskDice: '2d6',
  oracleLikelihoods: [
    {
      id: 'impossible' as const,
      label: 'No way',
      threshold: 1,
      description: 'Yes only on a 1',
    },
    {
      id: 'unlikely' as const,
      label: 'Unlikely',
      threshold: 2,
      description: 'Yes on 1–2',
    },
    {
      id: 'even' as const,
      label: '50/50',
      threshold: 3,
      description: 'Yes on 1–3',
    },
    {
      id: 'likely' as const,
      label: 'Likely',
      threshold: 4,
      description: 'Yes on 1–4',
    },
    {
      id: 'certain' as const,
      label: 'Almost certain',
      threshold: 5,
      description: 'Yes on 1–5',
    },
  ],
  twistTable: [
    { roll: 1, text: 'Introduce a new fact that complicates things' },
    { roll: 2, text: 'Remove or invalidate an established fact' },
    { roll: 3, text: 'Shift the scene — location, time, or tone changes' },
    { roll: 4, text: 'A NPC acts unexpectedly or reveals something' },
    { roll: 5, text: 'An object is lost, found, broken, or transformed' },
    { roll: 6, text: 'Things get worse — escalate the danger or cost' },
  ],
  scenePrompts: [
    'Where are you, and what do you want here?',
    'Who or what stands between you and your goal?',
    'What detail makes this place feel real?',
    'What do you try first — and what could go wrong?',
    'How does your nemesis make itself felt?',
  ],
};
