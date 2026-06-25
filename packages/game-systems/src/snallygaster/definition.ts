import type { SheetDefinition } from '../types';

export const snallygasterSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'camper',
      title: 'Camper',
      description: 'Summer at Camp Snallygaster — where the woods remember.',
      fields: [
        {
          key: 'camper_name',
          label: 'Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Your camp name',
        },
        {
          key: 'cabin',
          label: 'Cabin',
          type: 'text',
          defaultValue: '',
          placeholder: 'Cabin number or nickname',
        },
        {
          key: 'counselor_stat',
          label: 'Counselor',
          type: 'number',
          defaultValue: 3,
          description: 'Roll 3d6 — succeed if any die is higher (when helping, protecting, solving)',
        },
        {
          key: 'monster_stat',
          label: 'Monster',
          type: 'number',
          defaultValue: 3,
          description: 'Roll 3d6 — succeed if any die is lower (when sneaking, scaring, surviving horror)',
        },
      ],
    },
    {
      id: 'drives',
      title: 'Camp life',
      fields: [
        {
          key: 'fear',
          label: 'What you fear',
          type: 'text',
          defaultValue: '',
          placeholder: 'The thing you won\'t say out loud at the fire',
        },
        {
          key: 'secret',
          label: 'Secret',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'What happened last summer — or what you saw in the trees',
        },
        {
          key: 'summer_goal',
          label: 'Summer goal',
          type: 'text',
          defaultValue: '',
          placeholder: 'Badge, friendship, revenge, escape…',
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
          placeholder: 'Counselors, campers, trails, rumors…',
        },
      ],
    },
  ],
};

export const snallygasterSoloEngine = {
  kind: 'lasers-feelings' as const,
  scenePrompts: [
    'What activity is camp running today, and who\'s paired with you?',
    'What sound from the woods doesn\'t belong?',
    'Which counselor is acting strange — and who notices?',
    'Lights-out is in an hour. What aren\'t you telling anyone?',
    'Someone goes missing for twenty minutes. Where do you look first?',
    'A storm rolls in during assembly. Who clutches your sleeve?',
    'The camp legend gets told again. What detail changed this year?',
    'Mail day — who got a letter they did not want?',
  ],
  lasersFeelings: {
    counselorLabel: 'Counselor',
    monsterLabel: 'Monster',
    problemTable: [
      { roll: 1, text: 'A camper swears they saw something in the lake' },
      { roll: 2, text: 'Supplies vanish from the craft shed overnight' },
      { roll: 3, text: 'A storm knocks out power to one cabin row' },
      { roll: 4, text: 'An old trail on the map doesn\'t match the woods' },
      { roll: 5, text: 'A counselor\'s story about the camp doesn\'t add up' },
      { roll: 6, text: 'Something scratches at the window during rest hour' },
      { roll: 7, text: 'A dare goes too far at the dock after curfew' },
      { roll: 8, text: 'Someone\'s sleepwalking toward the tree line' },
      { roll: 9, text: 'A recording plays back a voice that wasn\'t there' },
      { roll: 10, text: 'The camp mascot costume is found muddied miles from storage' },
      { roll: 11, text: 'A new camper knows names they shouldn\'t' },
      { roll: 12, text: 'Fire drill — but the smoke isn\'t from the practice pit' },
    ],
    activityTable: [
      { roll: 1, text: 'Archery — whose arrow vanishes into the pines?' },
      { roll: 2, text: 'Lake swim — who refuses to go past the raft?' },
      { roll: 3, text: 'Craft hour — what symbol keeps appearing in the beads?' },
      { roll: 4, text: 'Night hike — who hears singing off-trail?' },
      { roll: 5, text: 'Campfire stories — whose tale makes a counselor go quiet?' },
      { roll: 6, text: 'Cabin inspection — what\'s hidden under the loose floorboard?' },
      { roll: 7, text: 'Talent show rehearsal — what act was not on the schedule?' },
      { roll: 8, text: 'Mess hall duty — food tastes like metal tonight' },
    ],
  },
  twistTable: [
    { roll: 1, text: 'A friend was in on it the whole time' },
    { roll: 2, text: 'The danger is real — and closer than you thought' },
    { roll: 3, text: 'It was a prank, but someone got hurt' },
    { roll: 4, text: 'An adult already knows — they\'re covering it up' },
    { roll: 5, text: 'You were the one who started this years ago' },
    { roll: 6, text: 'The Snallygaster legend is wrong about what it wants' },
    { roll: 7, text: 'The horror wanted to be seen — by you specifically' },
    { roll: 8, text: 'Saving someone means breaking a camp rule permanently' },
  ],
};
