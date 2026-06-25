import type { SheetDefinition } from '../types';

export const muscadinesSheetDefinition: SheetDefinition = {
  sections: [
    {
      id: 'marmateer',
      title: 'Marmateer',
      description: 'Midnight Muscadines — cozy-dark folklore and magical preserves.',
      fields: [
        {
          key: 'marmateer_name',
          label: 'Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Your name among the grove',
        },
        {
          key: 'grove',
          label: 'Grove',
          type: 'text',
          defaultValue: '',
          placeholder: 'Where your vines grow — orchard, hollow, rooftop garden…',
        },
        {
          key: 'jam_specialty',
          label: 'Jam specialty',
          type: 'text',
          defaultValue: '',
          placeholder: 'Your signature preserve and what it does',
        },
        {
          key: 'mentor',
          label: 'Mentor',
          type: 'text',
          defaultValue: '',
          placeholder: 'Who taught you the old ways',
        },
        {
          key: 'season_mood',
          label: 'Season mood',
          type: 'text',
          defaultValue: '',
          placeholder: 'Late harvest, first frost, thunder week…',
        },
      ],
    },
    {
      id: 'cozy',
      title: 'Cozy & dark',
      fields: [
        {
          key: 'cozy_dark',
          label: 'Your cozy-dark tension',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'What comforts you — and what haunts the same hearth',
        },
        {
          key: 'inventory',
          label: 'Pantry & tools',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Jars, herbs, borrowed books, favors owed…',
        },
        {
          key: 'recipe_notes',
          label: 'Recipe notes',
          type: 'textarea',
          defaultValue: '',
          placeholder: 'Ingredients, stir-counts, warnings in the margin…',
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
          placeholder: 'Neighbors, spirits, recipes, debts…',
        },
      ],
    },
  ],
};

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
  twistTable: [
    { roll: 1, text: 'A jar cracks — the magic leaks somewhere unexpected' },
    { roll: 2, text: 'A neighbor brings gossip that changes your recipe' },
    { roll: 3, text: 'Your mentor\'s advice contradicts what you remember' },
    { roll: 4, text: 'Something in the grove wakes before harvest' },
    { roll: 5, text: 'A debt from the cozy past comes due at the darkest hour' },
    { roll: 6, text: 'The jam works too well — someone notices' },
    { roll: 7, text: 'A kindness you gave returns twisted' },
    { roll: 8, text: 'The hearth fire shows you a face in the coals' },
  ],
  scenePrompts: [
    'What are you preserving tonight, and for whom?',
    'What sound from the grove pulls you from the kitchen?',
    'Who knocks after midnight with an empty jar?',
    'Which neighbor leaves offerings at your fence?',
    'What old song do you hum while the sugar boils?',
    'What does the weather promise — comfort or omen?',
  ],
  mentorPrompts: [
    { id: 'stir', label: 'Stir the pot', text: 'Describe what you\'re cooking. What memory rises with the steam?' },
    { id: 'neighbor', label: 'A neighbor calls', text: 'Someone needs a jar — or a secret. What do they offer in trade?' },
    { id: 'mentor-echo', label: 'Mentor\'s echo', text: 'Your mentor speaks through an old note or dream. What instruction do you follow?' },
    { id: 'harvest', label: 'Midnight harvest', text: 'Pick fruit by moonlight. What watches from the treeline?' },
    { id: 'comfort', label: 'Cozy interlude', text: 'Pause for warmth — tea, blanket, fire. What small joy steadies you?' },
    { id: 'shadow', label: 'Dark turn', text: 'The cozy cracks. What truth were you avoiding?' },
    { id: 'gift-jar', label: 'Gift a jar', text: 'Who receives your preserve — and what unintended effect follows?' },
    { id: 'old-debt', label: 'Old debt', text: 'Someone you owe appears at the door. Do you pay with jam, labor, or silence?' },
    { id: 'storm-night', label: 'Storm night', text: 'Rain hammers the roof. What do you bar the door against?' },
    { id: 'recipe-test', label: 'Recipe test', text: 'Tweak the recipe. What variable do you change — fruit, time, or intention?' },
    { id: 'visitor', label: 'Strange visitor', text: 'A traveler knows your grove by name. How do you welcome them?' },
    { id: 'lullaby', label: 'Lullaby hour', text: 'Sing or speak softly to the jars. What answers?' },
  ],
  folkloreTables: {
    groveOmens: [
      { roll: 1, text: 'Muscadines ripen out of season on one vine only' },
      { roll: 2, text: 'A fox leaves three stones on your stoop' },
      { roll: 3, text: 'The wind smells like bruised plums and iron' },
      { roll: 4, text: 'Every jar lid pops once, together, at dawn' },
      { roll: 5, text: 'A path appears through the bramble you did not cut' },
      { roll: 6, text: 'Your shadow lingers a second too long on the wall' },
    ],
    jarResults: [
      { roll: 1, text: 'Comfort — grief softens for one honest night' },
      { roll: 2, text: 'Truth — someone speaks what they hid' },
      { roll: 3, text: 'Binding — two quarreling neighbors must share a meal' },
      { roll: 4, text: 'Warning — the eater dreams of teeth in the dark' },
      { roll: 5, text: 'Memory — a forgotten name returns bitter-sweet' },
      { roll: 6, text: 'Unintended — the magic works on the wrong person' },
    ],
  },
};
