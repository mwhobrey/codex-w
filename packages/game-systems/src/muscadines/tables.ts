import type { MentorPrompt, OracleTableEntry } from '../types';

/** Attribute names from public Character Options / backgrounds. */
export const MUSCADINES_ATTRIBUTES = ['strength', 'dexterity', 'willpower', 'heart'] as const;
export type MuscadinesAttribute = (typeof MUSCADINES_ATTRIBUTES)[number];

export const MUSCADINES_ATTRIBUTE_LABELS: Record<MuscadinesAttribute, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  willpower: 'Willpower',
  heart: 'Heart',
};

export const MUSCADINES_DIE_RATINGS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type MuscadinesDieRating = (typeof MUSCADINES_DIE_RATINGS)[number];

/** Playable folk names from the public Setting Guide. */
export const folkOptions = [
  "Bog's Garts",
  'Duskywhims',
  'Lumenite',
  'Murmurens',
  'Nimmians',
  'Patchfolk',
  'Tatterlings',
  'Twilits',
  'Wilderfolk',
  'Woadlings',
] as const;

/** Guild names from the public Setting Guide. */
export const guildOptions = [
  'Cloud Coven',
  'Marmateers',
  'Meadowlarch',
  'Pilcrow',
  'Sage Leaf',
  'Solen Society',
  'The Fieldhouse',
  'Verdangarde',
] as const;

export interface StyleOption {
  id: string;
  name: string;
  text: string;
}

/** Styles from public Character Options (CC BY-SA). */
export const styleOptions: StyleOption[] = [
  { id: 'starstruck-dreamer', name: 'Starstruck Dreamer', text: 'Gazes at the skies, lost in thought, weaving constellations into grand tales.' },
  { id: 'shadow-whisperer', name: 'Shadow Whisperer', text: 'Finds comfort in the Wildernight, speaking softly to unseen creatures and listening for answers.' },
  { id: 'luminous-optimist', name: 'Luminous Optimist', text: 'Radiates an infectious warmth, treating every problem as a puzzle waiting to be solved.' },
  { id: 'pious-harvester', name: 'Pious Harvester', text: 'Knows every wondrous plant and fungi, collecting them with reverence and murmured blessings.' },
  { id: 'weaver-poet', name: 'Weaver Poet', text: "Sees beauty in everything and composes songs about the land's hidden glories and dangers." },
  { id: 'gilded-storyteller', name: 'Gilded Storyteller', text: 'A master of exaggerated tales, spinning lore and laughter to light even the darkest moments.' },
  { id: 'beacon-keeper', name: 'Beacon Keeper', text: "A steady and reliable soul, glowing with pride in their duty to maintain the beacons' light." },
  { id: 'twilight-artisan', name: 'Twilight Artisan', text: 'Crafts intricate tools and trinkets infused with the beauty and mystery of the bordering twilight.' },
  { id: 'solen-hermit', name: 'Solen Hermit', text: "Prefers the quiet company of the sun shards' glow and whispers ancient idioms when least expected." },
  { id: 'jam-sage', name: 'Jam Sage', text: 'Knows every flavor and interaction by heart, with a quiet confidence in the effects of unknown ingredients.' },
  { id: 'firefly-chaser', name: 'Firefly Chaser', text: 'Always chasing small moments of wonder, collecting glowbugs and twinkling memories.' },
  { id: 'vagabond-bard', name: 'Vagabond Bard', text: 'Sings tunes of recent events across Nimm and is always packed for the next grand adventure.' },
  { id: 'dewdrop-keeper', name: 'Dewdrop Keeper', text: 'Finds joy in the smallest things, treasuring fleeting morning dewdrops and tiny, forgotten magic.' },
  { id: 'lantern-mender', name: 'Lantern Mender', text: 'Sees broken things as opportunities to create beauty, stitching light into the cracks.' },
  { id: 'twilight-gambler', name: 'Twilight Gambler', text: 'Takes calculated risks with a sly grin, trusting instincts over the odds, always teetering on the edge.' },
  { id: 'vine-clad-wanderer', name: 'Vine-Clad Wanderer', text: 'Moves as if part of the landscape, vines tangled in hair, and leaves rustling gently.' },
  { id: 'shadowmoss-collector', name: 'Shadowmoss Collector', text: 'Treasures things others overlook, gathering peculiar relics from back alleys or forgotten wilds.' },
  { id: 'larkspur-defender', name: 'Larkspur Defender', text: 'Fierce in protecting what they love, whether a field of flowers or a friend in danger.' },
  { id: 'emberglow-archivist', name: 'Emberglow Archivist', text: "Delights in preserving and passing down stories, recipes, and secrets of Nimm and the Wildernight's past." },
  { id: 'starfall-dancer', name: 'Starfall Dancer', text: 'Moves with fluid, dreamlike grace, as if always caught in a fleeting waltz with falling stars.' },
];

export interface QuirkOption {
  id: string;
  name: string;
  text: string;
}

/** Quirks from public Character Options (CC BY-SA). */
export const quirkOptions: QuirkOption[] = [
  { id: 'endless-hummer', name: 'Endless Hummer', text: 'Constantly hums tunes under their breath, even in tense or silent moments.' },
  { id: 'fidgeting-hands', name: 'Fidgeting Hands', text: 'Always tinkering, twisting, or fiddling with small objects, even if imaginary.' },
  { id: 'nervous-over-explainer', name: 'Nervous Over-Explainer', text: 'Feels compelled to explain everything in exhausting detail, even the obvious.' },
  { id: 'startled-by-shadows', name: 'Startled by Shadows', text: 'Jumps at their own shadow, despite their bravery, and apologizes for the outburst.' },
  { id: 'unintentional-rhymer', name: 'Unintentional Rhymer', text: 'Has a habit of speaking in rhymes without realizing it, often to their own frustration.' },
  { id: 'forgetful-finder', name: 'Forgetful Finder', text: 'Frequently misplaces important items, only to rediscover them in odd or unexpected places.' },
  { id: 'overpacker', name: 'Overpacker', text: 'Carries far too many items “just in case,” often struggling with the weight of their own bag.' },
  { id: 'starry-sleeper', name: 'Starry Sleeper', text: 'Falls asleep under the stars at the slightest chance, even in inconvenient or dangerous spots.' },
  { id: 'overly-punctual', name: 'Overly Punctual', text: "Insists on arriving early to everything and gets anxious if others don't share their urgency." },
  { id: 'collector-of-oddities', name: 'Collector of Oddities', text: 'Hoards strange, useless objects, from cracked jars to oddly-shaped stones, with sentimental zeal.' },
  { id: 'compulsive-jam-taster', name: 'Compulsive Jam Taster', text: 'Sneaks a teaspoonful of jam at every opportunity, even during serious or risky situations.' },
  { id: 'accidental-whisperer', name: 'Accidental Whisperer', text: 'Speaks too softly in moments of excitement or tension, forcing others to ask them to repeat things.' },
  { id: 'superstitious-stepper', name: 'Superstitious Stepper', text: 'Refuses to step on cracks, shadows, or certain patterns, for fear of bad luck.' },
  { id: 'habitual-apologizer', name: 'Habitual Apologizer', text: 'Apologizes for everything, even for things which are clearly not their fault.' },
  { id: 'eternal-optimist', name: 'Eternal Optimist', text: 'Insists everything will “work out fine,” to the point of irritating their more practical friends.' },
  { id: 'uncanny-eye-contact', name: 'Uncanny Eye Contact', text: 'Stares a little too long during conversations, making people feel either seen or unnerved.' },
  { id: 'procrastinating-perfectionist', name: 'Procrastinating Perfectionist', text: 'Constantly puts off tasks because they feel the need to get every detail just right.' },
  { id: 'forgetful-nametagger', name: 'Forgetful Nametagger', text: "Struggles to remember names, compensating with creative nicknames that don't always land." },
  { id: 'worrywart-weaver', name: 'Worrywart Weaver', text: 'Over analyzes every situation and spins elaborate what-if scenarios, often out loud.' },
  { id: 'giggly-under-pressure', name: 'Giggly Under Pressure', text: 'Has an uncontrollable nervous laugh in dire or awkward situations, often causing embarrassment.' },
];

/** Starting d6 item names from public Character Options (CC BY-SA). */
export const startingItemOptions = [
  'Beacon Compass',
  'Wildering Map',
  'Shadow Lantern',
  'Aquilo Cloak',
  'Wayfarer Rations',
  'Whisper Stone',
  "Eostre's Bandages",
  'Fore Master Multi-Tool',
  'Starlight Sextant',
  'Zephyrus Rope',
  "Weaver's Blade",
  'Whipper Willow Bow',
  'Foxfire Horn',
  'Wildernight Almanac',
  'Mist Cloak',
  'Moonstone Amulet',
  'Portable Alchemy Kit',
  'Dream Net',
  'Wildroot Boots',
  'Nyxian Spyglass',
  'Glowthread Needle',
  'Lantern Staff',
  'Shadowveil Tarp',
  'Tanglethorn Sandals',
  'Hearthkeeper Kettle',
  'Verdant Satchel',
  'Echo Inkpen',
  'Marmateer Feather',
  'Berrybrew Flask',
  'Sootwing Kite',
  'Solen Medallion',
  'Moonring Eyeglass',
  'Chanter Poultice',
  'Whisperroot Charm',
  'Thornbill Quill',
  'Brindlehowl Whistle',
  'Lantern Maw Candel',
  'Berryboggle Cologne',
  'Veil Serpent Shawl',
  'Mossback Bell',
  'Lumenite Hairclip',
  'Dewrunner Spear',
  'Stormglass Bow',
  'Tatterling Threads',
  'Lumenite Chakram',
  'Sothis Bellows',
  'Voidroot Trowel',
  'Beacon Basket',
  'Duskbell Grimoire',
  'Brightbark Balm',
  'Woadling Shears',
  'Shard-Kissed Bedroll',
] as const;

export function styleTable(): OracleTableEntry[] {
  return styleOptions.map((row, index) => ({
    roll: index + 1,
    text: `${row.name} — ${row.text}`,
  }));
}

export function quirkTable(): OracleTableEntry[] {
  return quirkOptions.map((row, index) => ({
    roll: index + 1,
    text: `${row.name} — ${row.text}`,
  }));
}

export function startingItemTable(): OracleTableEntry[] {
  return startingItemOptions.map((name, index) => ({
    roll: index + 1,
    text: name,
  }));
}

/**
 * Mentor prompts — category labels match public FAQ examples;
 * guidance text is Codex-authored for the play aid (not book prose).
 */
export const mentorPrompts: MentorPrompt[] = [
  {
    id: 'raise-stakes',
    label: 'Raise the Stakes',
    text: 'Escalate the current trouble without solving it. What new cost, timer, or witness appears? Keep cozy hope visible at the edges.',
  },
  {
    id: 'uncover-mystery',
    label: 'Uncover a Mystery',
    text: 'Reveal a clue that answers one question and raises two more. Tie it to Nimm tradition, a guild agenda, or the Wildernight.',
  },
  {
    id: 'introduce-rival',
    label: 'Introduce a Rival',
    text: 'Bring in someone who wants the same harvest, jar, or answer — charming enough to share tea, sharp enough to complicate the road.',
  },
  {
    id: 'telegraph-danger',
    label: 'Telegraph a Danger',
    text: 'Hint at a threat before it strikes. Shadows of Tume, a restless spirit, or a social snare — give players time to prepare.',
  },
  {
    id: 'offer-comfort',
    label: 'Offer Comfort',
    text: 'Pause for warmth: a meal, a festival game, a lantern-lit porch. What small kindness steadies the party before the next trek?',
  },
  {
    id: 'harvest-call',
    label: 'Call of the Harvest',
    text: 'A rumor of midnight muscadines surfaces — strange phenomena, overflowing magic, or a map that should not exist. Who told you?',
  },
  {
    id: 'guild-pressure',
    label: 'Guild Pressure',
    text: 'A guild asks a favor that smells cozy on the surface. What darker agenda peeks through the request?',
  },
  {
    id: 'wildernight-shift',
    label: 'Wildernight Shift',
    text: 'The path changes. A landmark moves, a song fades, or the twilight thickens. What landmark still feels true?',
  },
  {
    id: 'jar-complication',
    label: 'Jar Complication',
    text: 'Something about the jam or jar misbehaves — flavor, effect, or attention it draws. Who notices first?',
  },
  {
    id: 'npc-need',
    label: 'Someone Needs You',
    text: 'A neighbor, traveler, or creature asks for help that cannot be bought with coin. What do they offer instead?',
  },
  {
    id: 'moral-choice',
    label: 'Soft Moral Choice',
    text: 'Force a choice between two goods (or two soft harms). No surprise death — make the cost narrative and memorable.',
  },
  {
    id: 'festival-beat',
    label: 'Festival Beat',
    text: 'Drop a festival event or drama into the scene. Can the players ignore the drama and still enjoy the evening?',
  },
];
