import type { SheetDefinition } from '../types';

export const genericSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Identity',
      description: 'Who is this character, at a glance?',
      fields: [
        {
          key: 'given_name',
          label: 'Character name',
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
          key: 'concept',
          label: 'Concept',
          type: 'text',
          defaultValue: '',
          placeholder: 'Burned spy seeking redemption',
        },
        {
          key: 'backstory',
          label: 'Backstory',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Where they came from, what they want…',
        },
      ],
    },
    {
      id: 'attributes',
      title: 'Attributes',
      description: 'Rename stat labels to match your table — Body, Mind, or STR, WIS, whatever.',
      fields: [
        { key: 'body', label: 'Body', type: 'number', defaultValue: 0 },
        { key: 'reflex', label: 'Reflex', type: 'number', defaultValue: 0 },
        { key: 'mind', label: 'Mind', type: 'number', defaultValue: 0 },
        { key: 'heart', label: 'Heart', type: 'number', defaultValue: 0 },
        { key: 'spirit', label: 'Spirit', type: 'number', defaultValue: 0 },
        { key: 'edge', label: 'Edge', type: 'number', defaultValue: 0 },
      ],
    },
    {
      id: 'vitals',
      title: 'Vitals',
      fields: [
        { key: 'health', label: 'Health', type: 'number', defaultValue: 0 },
        { key: 'stress', label: 'Stress', type: 'number', defaultValue: 0 },
        { key: 'armor', label: 'Armor', type: 'number', defaultValue: 0 },
      ],
    },
    {
      id: 'gear',
      title: 'Gear',
      fields: [
        {
          key: 'equipment',
          label: 'Equipment',
          type: 'list',
          defaultValue: [],
          placeholder: 'Add an item…',
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
          placeholder: 'Anything else worth remembering.',
        },
      ],
    },
  ],
};

export const genericSoloEngine = {
  kind: 'oracle' as const,
  oracleDice: '1d6',
  riskDice: '2d6',
  oracleLikelihoods: [
    { id: 'impossible' as const, label: 'No way', threshold: 1, description: 'Yes only on a 1' },
    { id: 'unlikely' as const, label: 'Unlikely', threshold: 2, description: 'Yes on 1–2' },
    { id: 'even' as const, label: '50/50', threshold: 3, description: 'Yes on 1–3' },
    { id: 'likely' as const, label: 'Likely', threshold: 4, description: 'Yes on 1–4' },
    { id: 'certain' as const, label: 'Almost certain', threshold: 5, description: 'Yes on 1–5' },
  ],
  twistTable: [
    { roll: 1, text: 'A new complication appears' },
    { roll: 2, text: 'Something established turns out to be wrong' },
    { roll: 3, text: 'The scene shifts — place, time, or mood' },
    { roll: 4, text: 'Someone acts against expectations' },
    { roll: 5, text: 'An object is lost, found, or changed' },
    { roll: 6, text: 'The stakes rise — cost or danger increases' },
  ],
  scenePrompts: [
    'Where are you, and what do you want?',
    'What stands between you and that goal?',
    'What detail makes this moment feel real?',
    'What do you try first — and what could go wrong?',
    'Who or what pushes back hardest?',
  ],
};
