import type { SheetDefinition } from '../types';

export const ironforgeSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'identity',
      title: 'Foundry soul',
      description: 'Ironforge — grim industrial survival where oaths are hammered, not spoken.',
      fields: [
        {
          key: 'callsign',
          label: 'Callsign',
          type: 'text',
          defaultValue: '',
          placeholder: 'What the yards know you by',
        },
        {
          key: 'role',
          label: 'Role',
          type: 'text',
          defaultValue: '',
          placeholder: 'Scrapper, smelter, courier, warder…',
        },
        {
          key: 'district',
          label: 'District',
          type: 'text',
          defaultValue: '',
          placeholder: 'Slag Quarter, Canal Works, Ashline…',
        },
      ],
    },
    {
      id: 'oath',
      title: 'Iron oath',
      fields: [
        {
          key: 'iron_oath',
          label: 'Your oath',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'What you swore to finish — no matter what the forge demands',
        },
        {
          key: 'iron_nemesis',
          label: 'What opposes you',
          type: 'text',
          defaultValue: '',
          placeholder: 'Foreman, syndicate, storm, guilt…',
        },
      ],
    },
    {
      id: 'stats',
      title: 'Heat & grit',
      fields: [
        {
          key: 'grit',
          label: 'Grit',
          type: 'number',
          defaultValue: 1,
          description: 'Added to 2d6 when you face the forge (0–3)',
        },
        {
          key: 'heat',
          label: 'Heat',
          type: 'number',
          defaultValue: 0,
          description: 'How much trouble is hunting you (0–10)',
        },
      ],
    },
    {
      id: 'kit',
      title: 'Kit',
      fields: [
        { key: 'tool', label: 'Tool', type: 'text', defaultValue: '', placeholder: 'What keeps you alive' },
        { key: 'charm', label: 'Charm', type: 'text', defaultValue: '', placeholder: 'Luck, saint, coin, grudge…' },
        { key: 'stash', label: 'Stash', type: 'text', defaultValue: '', placeholder: 'Hidden stockpile or favor' },
      ],
    },
    {
      id: 'scars',
      title: 'Scars & notes',
      fields: [
        {
          key: 'scars',
          label: 'Scars',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'What the industry took from you',
        },
        {
          key: 'notes',
          label: 'Notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Rumors, routes, debts…',
        },
      ],
    },
  ],
};

export const ironforgeSoloEngine = {
  kind: 'vow-progress' as const,
  scenePrompts: [
    'What shift just ended, and what are you still carrying from it?',
    'Where does the smoke taste wrong tonight?',
    'Who owes you — and who pretends they do not?',
    'What machine sound stopped that should not have stopped?',
    'What promise did you make when the last oath-bearer fell?',
  ],
  vowProgress: {
    progressMax: 10,
    difficulties: [
      { id: 'risky', label: 'Risky', target: 7 },
      { id: 'dangerous', label: 'Dangerous', target: 9 },
      { id: 'extreme', label: 'Extreme', target: 11 },
    ],
    complicationTable: [
      { roll: 1, text: 'You attract the wrong kind of attention — heat rises' },
      { roll: 2, text: 'Equipment fails at the worst moment' },
      { roll: 3, text: 'An ally flinches or sells you out' },
      { roll: 4, text: 'The path closes — you need a costly detour' },
      { roll: 5, text: 'Old debt comes due mid-stride' },
      { roll: 6, text: 'You succeed, but pay in blood, time, or trust' },
    ],
    hazardTable: [
      { roll: 1, text: 'Toxic spill — mask, burn, or blindness' },
      { roll: 2, text: 'Strike rumor — lines freeze, fists sharpen' },
      { roll: 3, text: 'Boiler whisper — pressure builds somewhere nearby' },
      { roll: 4, text: 'Blackout slice — lights die in one district' },
      { roll: 5, text: 'Inspection sweep — papers, bribes, or running' },
      { roll: 6, text: 'Collapse — masonry, catwalk, or certainty gives way' },
    ],
  },
};
