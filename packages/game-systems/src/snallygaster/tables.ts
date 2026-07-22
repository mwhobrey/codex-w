import type { MentorPrompt, OracleTableEntry } from '../types';

/**
 * Camp Snallygaster tables — derived from Camp Snallygaster by Pandion Games
 * (CC BY 4.0), adapted from Lasers & Feelings by John Harper (CC BY 4.0).
 * See NOTICE. Book art/layout not included.
 */

export interface StyleOption {
  id: string;
  style: string;
  item: string;
  skill: number;
}

export interface SpecialtyOption {
  id: string;
  specialty: string;
  items: string;
  skill: number;
}

export const styleOptions: StyleOption[] = [
  { id: 'jumps', style: 'Jumps off cliffs before checking the water', item: 'Flare Gun', skill: 3 },
  { id: 'leads', style: 'Leads the midnight hikes, no flashlight needed', item: 'Campground Map', skill: 2 },
  { id: 'listens', style: 'Listens more than talking, keeping an eye out', item: 'Emergency Whistle', skill: 1 },
  { id: 'earns', style: 'Earns laughter faster than merit badges', item: 'Marshmallow Roasting Sticks', skill: 1 },
  { id: 'carries', style: 'Carries snacks and band-aids', item: 'Altoids Tin of Band-aids', skill: 1 },
  { id: 'plans', style: 'Plans every activity down to the backup sunscreen', item: 'Walkie-Talkie', skill: 2 },
  { id: 'vanishes', style: 'Vanishes just before lights out', item: 'Flashlight', skill: 3 },
  { id: 'brightens', style: 'Brightens even chores with sing-alongs', item: 'Waterproof Songbook', skill: 2 },
];

export const specialtyOptions: SpecialtyOption[] = [
  { id: 'paddling', specialty: 'Paddling', items: 'wooden paddle, dry-bag, life vest', skill: 1 },
  { id: 'survival', specialty: 'Survival', items: 'folding utensils, paracord bracelet, emergency blanket', skill: 2 },
  { id: 'knots', specialty: 'Knots', items: 'rope, field guide, carabiners', skill: 2 },
  { id: 'food-prep', specialty: 'Food Prep', items: 'cast-iron skillet, spice set, leather apron', skill: 1 },
  { id: 'first-aid', specialty: 'First Aid', items: 'sewing kit, first-aid kit, baggie of medicines', skill: 1 },
  { id: 'foraging', specialty: 'Foraging', items: 'trowel, multi-tool, bag of mushrooms', skill: 1 },
  { id: 'archery', specialty: 'Archery', items: 'bow, arm guard, blunt-tipped arrows', skill: 2 },
  { id: 'bushcraft', specialty: 'Bushcraft', items: 'pocket knife, waterproof matches, nails & twine', skill: 2 },
];

export const motivationOptions = [
  'Keep your camper safe',
  'Find the camp leader',
  'Befriend the monster',
  'Rid the camp of the monster',
  'Eat your favorite meal one more time',
  'Make it home',
];

export const safeLocationOptions = [
  'Campsite Three',
  'Fire Pit',
  'Latrines',
  "Leader's Office",
  'Mess Hall',
  "Nurse's Cabin",
  'Parking Lot',
];

export const dangerousLocationOptions = [
  'Archery Field',
  'Docks',
  'Everhewn Lake',
  'Flooded Mine',
  "Forest's Edge",
  'Old Well',
  'Radio Tower',
  'Swimming Pool',
];

/** Camp leader fate — Game Ranger plot table */
export const campLeaderTable: OracleTableEntry[] = [
  { roll: 1, text: 'was captured and is deep in the monster’s lair, injured and awaiting their death.' },
  { roll: 2, text: 'was hunting the monster themselves and got lost, injured or captured, and is actively trying to make it back.' },
  { roll: 3, text: 'is part of a larger conspiracy to feed campers to the monster to appease it.' },
  { roll: 4, text: 'was actively protecting the camp and lands against the monster, but succumbed.' },
  { roll: 5, text: 'has been using the monster to summon something even worse and is succeeding.' },
  { roll: 6, text: 'was slaughtering the monster’s offspring for trophies and is the reason it is now attacking the camp.' },
  { roll: 7, text: 'never existed.' },
  { roll: 8, text: 'sealed something away decades ago, but the seal has broken.' },
  { roll: 9, text: 'made a pact with something within Camp Snallygaster for a single perfect summer, and repayment is now due.' },
  { roll: 10, text: 'isn’t gone, but transformed.' },
  { roll: 11, text: 'was split into multiple entities during a failed mystical ritual.' },
  { roll: 12, text: 'discovered markings appearing across the camp and got too close to the answer.' },
];

export const monsterTable: OracleTableEntry[] = [
  { roll: 1, text: 'Wendigo — a deer skull headed creature that viciously eats anyone who enters its forest.' },
  { roll: 2, text: 'Lindworm — a long, legless serpent with pale, rotting skin and a mouth full of human teeth.' },
  { roll: 3, text: 'Baba Yaga — old crones that trick and collect children by appealing to their desires.' },
  { roll: 4, text: 'Mothman — a winged humanoid that hunts humans while darting from tree branches.' },
  { roll: 5, text: 'Teakettler — a stubby dog with cat ears that walks backwards and boils victims with steam from its mouth.' },
  { roll: 6, text: 'Kelpie — a shape shifting water horse that lures people into the lake and drowns them.' },
  { roll: 7, text: 'Person — cunning and scheming, sure of themselves, they will stop at nothing.' },
  { roll: 8, text: 'Snallygaster — a winged, beaked beast with tentacles protruding from its mouth, thirsting for blood.' },
  { roll: 9, text: 'Knotmother — a tangled mass of vines and hair that whispers comforts to homesick campers.' },
  { roll: 10, text: 'Ragman — a patchwork figure of stitched-together items; collects pieces of campers, and those who see him slowly forget who they are.' },
  { roll: 11, text: 'Hollowtooth — a human shaped void with a wide grin that stretches into sickening shapes to swallow campers whole.' },
  { roll: 12, text: 'Kushtaka — an otter-like shapeshifter that mimics laughter and cries for help.' },
];

/** Monster motive — “That is…” */
export const monsterMotiveTable: OracleTableEntry[] = [
  { roll: 1, text: 'trying to be friends with everyone, but keeps messing up and killing people instead.' },
  { roll: 2, text: 'feeding off fear and misery, so it doesn’t kill, only wounds and tortures.' },
  { roll: 3, text: 'a truly evil and unfeeling creature who plays with its prey before killing it.' },
  { roll: 4, text: 'attempting to break free of its prison within the camp.' },
  { roll: 5, text: 'cuddly and cute until night, when it transforms into a monstrous creature and kills its victims.' },
  { roll: 6, text: 'summoned by the camp leader (or a camper) practicing magic they didn’t understand.' },
  { roll: 7, text: 'protecting something buried beneath the camp.' },
  { roll: 8, text: 'convinced the campers are its long-lost children.' },
  { roll: 9, text: 'a previous season’s camper abandoned to their fate.' },
  { roll: 10, text: 'not just one monster…' },
  { roll: 11, text: 'trapped in an endless loop.' },
  { roll: 12, text: 'attempting to become human. “You are what you eat.”' },
];

export const activityTable: OracleTableEntry[] = [
  { roll: 1, text: 'Archery — Archery Field' },
  { roll: 2, text: 'Canoeing — Everhewn Lake' },
  { roll: 3, text: 'Orienteering — Old Forest' },
  { roll: 4, text: 'Cooking — Mess Hall' },
  { roll: 5, text: 'Spelunking — Flooded Mine' },
  { roll: 6, text: 'Swimming Lessons — Swimming Pool' },
  { roll: 7, text: 'Plant Identification — Forest Edge' },
  { roll: 8, text: 'Bush Craft — The Fire Pit' },
  { roll: 9, text: "Arts and Crafts — Leader's Office" },
  { roll: 10, text: "First Aid — Nurse's Office" },
  { roll: 11, text: 'Amateur Radio — Radio Tower' },
  { roll: 12, text: 'Fishing — The Docks' },
];

export const locationTable: OracleTableEntry[] = [
  ...safeLocationOptions.map((name, i) => ({ roll: i + 1, text: `${name} (safe)` })),
  ...dangerousLocationOptions.map((name, i) => ({
    roll: safeLocationOptions.length + i + 1,
    text: `${name} (dangerous)`,
  })),
];

/** Mundane Problems I + II (40) — “The Kids Aren't Alright” */
export const mischiefTable: OracleTableEntry[] = [
  { roll: 1, text: 'Several campers are sneaking out to go skinny dipping. One tries to dive off the docks and hits their head.' },
  { roll: 2, text: 'The campers have discovered the Flooded Mine and several are trapped inside as the waters rise.' },
  { roll: 3, text: "A canoe has capsized and some campers weren't wearing their life vests and can't swim." },
  { roll: 4, text: 'Somehow three campers have arrows sticking out of them. They were supposed to be locked up!' },
  { roll: 5, text: "Several campers didn't turn up for the dinner bell. They were last seen heading into the forest." },
  { roll: 6, text: 'A camper found an old wasp nest and decided to “poke it with a stick to see what would happen.”' },
  { roll: 7, text: "A kid was dared to climb the old radio tower, and now it looks like it may come apart while they're up there." },
  { roll: 8, text: 'Several campers are having a peach slice swallowing contest. One of them starts choking, another is feeling nauseous.' },
  { roll: 9, text: 'Some campers think it would be funny to run around stabbing each other with syringes found in an old first aid kit.' },
  { roll: 10, text: "Someone has gotten their foot stuck in the swimming pool's water return and can't keep their head above water." },
  { roll: 11, text: 'While learning to whittle, a camper has sliced their hand open and is bleeding everywhere.' },
  { roll: 12, text: "Someone threw an entire can of bug spray into the firepit. It hasn't exploded. Yet." },
  { roll: 13, text: 'Somehow a camper is broadcasting obscenities across the camp from the radio tower.' },
  { roll: 14, text: "Doing a headcount, you're missing two campers." },
  { roll: 15, text: 'Someone lost their compass during orienteering and is now lost deep in the forest.' },
  { roll: 16, text: 'A grease fire has erupted and the camper is running the pan to the water faucet.' },
  { roll: 17, text: 'A camper ran through stinging nettles and is now yelling and screaming in pain.' },
  { roll: 18, text: 'A fight has broken out between campers in a canoe, no one is wearing life vests, and punches are being thrown.' },
  { roll: 19, text: 'Someone left a lantern on after going to bed. The glass shatters and ignites their tent.' },
  { roll: 20, text: 'A camper learns, after being stung, that they are actually highly allergic to bees.' },
  { roll: 21, text: 'Someone decided to go “spelunking” into a small cave around the Flooded Mine. They\'re stuck. Very stuck.' },
  { roll: 22, text: 'A camper is trying to impress their crush by catching a snapping turtle barehanded.' },
  { roll: 23, text: "Two campers thought it'd be cool to camp overnight in a canoe in the middle of the lake. They're now stranded, sunburned, and surrounded by angry geese." },
  { roll: 24, text: 'Kids are using paddles as swords, and one has just lost a tooth in the ensuing “duel of honor,” bleeding all over.' },
  { roll: 25, text: "Someone dared another camper to eat ten uncooked hot dogs. He's on number seven and looking green." },
  { roll: 26, text: 'A group of campers has started a “cult” in Cabin 6, complete with fake sacrifices, paint, and a forbidden chant they made up. Some of the younger campers are terrified.' },
  { roll: 27, text: 'A camper dropped their retainer down the latrine and is currently trying to retrieve it with their hands.' },
  { roll: 28, text: 'The arts and crafts room is on lockdown because someone mixed glue, glitter, and paint thinner and lit it on fire “to see what color the flames would be.”' },
  { roll: 29, text: 'Kids have been sliding down the muddy hill behind the dining hall using dinner trays. One just dislocated their shoulder after hitting a tree.' },
  { roll: 30, text: 'Someone tied themselves to a tree “so they could become one with nature.” It\'s been three hours. The knot is very stuck.' },
  { roll: 31, text: 'A camper found a BB gun in the Radio Tower and is chasing squirrels, claiming it\'s ethical eating.' },
  { roll: 32, text: "Two campers built a raft out of pool noodles, twine, and plastic crates. They're currently stuck in the thick mud, sinking, and covered in leeches." },
  { roll: 33, text: 'Kids are trying to build a trebuchet out of firewood and tent poles. They want to “launch pine cones at the moon.”' },
  { roll: 34, text: 'A kid misunderstood firewatch duty and has been walking around camp at 2 a.m. with a lit torch.' },
  { roll: 35, text: "Two campers dared each other to jump from one bunk bed to another. One thinks they have a broken collarbone (they don't), the other is stuck between the wall and a mattress in a full panic." },
  { roll: 36, text: 'A camper brought fireworks from home and is preparing to “start the talent show with a bang.”' },
  { roll: 37, text: 'A camper has “made a potion” by mixing kitchen spices, lighter fluid, and lake water. They want to drink it.' },
  { roll: 38, text: 'Three campers have taken it upon themselves to create a homemade zipline from the Radio Tower to a nearby location. It\'s mostly twine and prayers.' },
  { roll: 39, text: 'A camper tried to impress their bunkmates by swallowing fireflies “to glow from the inside.” They are now sobbing and convinced they\'re dying.' },
  { roll: 40, text: 'A camper decided to feed the raccoons so they don\'t feel left out. Now the cabin is under siege by a dozen trash-hungry bandits.' },
];

export const monstrousTable: OracleTableEntry[] = [
  { roll: 1, text: "A kid loudly chants a name in their sleep. When awoken, they don't remember anything about it." },
  { roll: 2, text: 'All the camp compasses spin wildly, pointing toward one of the dangerous locations.' },
  { roll: 3, text: "A camper's reflection in the lake lags behind their movements, before disappearing." },
  { roll: 4, text: "Animal tracks appear overnight, but they don't match any known species in the field guides." },
  { roll: 5, text: 'The woods fall completely silent. No birds. No insects. Just… waiting.' },
  { roll: 6, text: "The camp's oldest tree starts weeping dark red sap with a sweet, rotting smell." },
  { roll: 7, text: 'A cabin is found rearranged: beds stacked, drawings on walls, scratching on the floor, but no signs of forced entry.' },
  { roll: 8, text: 'The sky turns the wrong color for a few minutes. A sickly purple, a swirling green, a yellow miasma.' },
  { roll: 9, text: 'A camper vanishes during hide and seek, only to be found an hour later, barefoot and cold, in a treehouse that had burned down last year…' },
  { roll: 10, text: "The camp's dinner bell rings in the middle of the night. It stops as soon as someone enters the mess hall. No one is near the bell's rope." },
  { roll: 11, text: 'A counselor finds an old camp photo from decades ago, with someone who looks exactly like them in it.' },
  { roll: 12, text: 'Flickering shadows dance along the edge of the campfire. When a camper approaches one, it disappears and a new shadow begins dancing.' },
  { roll: 13, text: 'A camper returns from the woods, covered in mud, saying they met someone “with no face.”' },
  { roll: 14, text: 'The mess hall smells of smoke and meat, though the stoves are cold and untouched.' },
  { roll: 15, text: 'The stars above camp shift slightly, forming a new, unfamiliar constellation. One that matches carvings in the caves by the lake.' },
  { roll: 16, text: "A puppet show performed by a few campers turns sinister. They don't recall practicing the show or why they put it on." },
  { roll: 17, text: 'Camp songs subtly change mid-performance, with new verses in strange, ancient-sounding words.' },
  { roll: 18, text: 'All clocks in camp stop at the same time each night: 3:17 a.m., their batteries dead.' },
  { roll: 19, text: 'A deep guttural hum rises from the woods each morning, lasting exactly 66 seconds.' },
  { roll: 20, text: 'A camper points to the empty woods and says, “They\'re almost here,” before collapsing, asleep.' },
];

export const decisionOracleTable: OracleTableEntry[] = [
  { roll: 1, text: 'No, and... - Not only is the answer no, but something additional or worse complicates the situation!' },
  { roll: 2, text: 'No - The answer is no; things remain unchanged or progress halts.' },
  { roll: 3, text: 'No, but... - While the answer is no, there is a silver lining or an alternative path forward.' },
  { roll: 4, text: 'Yes, but... - The answer is yes, but it comes with an unexpected consequence.' },
  { roll: 5, text: 'Yes - The answer is a straightforward yes; things go as hoped or expected.' },
  { roll: 6, text: 'Yes, and... - Not only is the answer yes, but there is an added benefit or unexpected positive twist.' },
];

export const mentorPrompts: MentorPrompt[] = [
  { id: 'set-scene', label: 'Set the Scene', text: 'Describe the surroundings — location, lighting, sounds — so everyone shares the same mental image.' },
  { id: 'complication', label: 'Introduce a Complication', text: 'Present an obstacle: adversaries, puzzles, or NPCs to convince. Challenges create drama and growth.' },
  { id: 'clue', label: 'Reveal a Clue', text: 'Give a measured piece of information that sparks speculation without solving everything at once.' },
  { id: 'npc', label: 'Create an NPC', text: 'Introduce someone new — appearance, personality, motivations, and role at camp.' },
  { id: 'dangers', label: 'Hint at Dangers', text: 'Foreshadow threats in the environment to build urgency without overwhelming.' },
  { id: 'twist', label: 'Add a Twist', text: 'Reveal something that forces the counselors to rethink what they thought they knew.' },
  { id: 'dilemma', label: 'Create a Moral Dilemma', text: 'Force a hard choice between values — selfless Counselor vs easy Monster.' },
  { id: 'rival', label: 'Introduce a Rival', text: 'A competing counselor, parent, or other credible threat who challenges the party.' },
  { id: 'past', label: 'Unveil the Past', text: 'Bring in camp history, a forgotten memory, or a relic that reframes the present.' },
  { id: 'weakness', label: 'Embrace a Weakness', text: 'Lean into a character weakness even when it hurts — growth through disadvantage.' },
  { id: 'resolve', label: 'Resolve a Conflict', text: 'Describe how a conflict ended, complications, and consequences that shape what comes next.' },
  { id: 'stakes', label: 'Raise the Stakes', text: 'Increase tension, urgency, or consequences — gradually, flowing from prior challenges.' },
  { id: 'focus', label: 'Shift the Focus', text: 'Highlight a secondary character, subplot, or overlooked detail for a new perspective.' },
  { id: 'thread', label: 'Bring in a New Thread', text: 'Introduce a seed that pulls at the story’s edges — a letter, stranger, or too-real dream.' },
  { id: 'symbol', label: 'Paint a Symbol', text: 'Place a vivid recurring symbol — let it accumulate meaning over the summer.' },
];

/** @deprecated alias — problemTable points at mundane mischief for library compat */
export const placeholderProblemTable = mischiefTable;
export const placeholderActivityTable = activityTable;
export const placeholderTwistTable: OracleTableEntry[] = monsterMotiveTable;
