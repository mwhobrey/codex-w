import type { MuscadinesAttribute } from './tables';

export interface MuscadinesAbility {
  name: string;
  text: string;
}

export interface MuscadinesBackground {
  id: string;
  name: string;
  summary: string;
  proficiencies: [MuscadinesAttribute, MuscadinesAttribute];
  endurance: number;
  protection: string;
  abilities: MuscadinesAbility[];
}

/** Backgrounds from public Setting Guide posts (CC BY-SA). */
export const muscadinesBackgrounds: MuscadinesBackground[] = [
  {
    id: 'bramblehand',
    name: 'Bramblehand',
    summary:
      'Part scavenger, part alchemist, part storyteller — you read biomes like a well-loved book and gather Wildernight fruits that bloom in hush and twilight.',
    proficiencies: ['willpower', 'strength'],
    endurance: 6,
    protection: '1d6',
    abilities: [
      {
        name: 'Murmurations of Flora',
        text: 'Sense flora signals. Instead of collecting, burn a card to forage for one ingredient of your choice with the same suit as the burned card.',
      },
      {
        name: 'Gutbrew Logic',
        text: 'Create a one-time concoction from found ingredients (description only, not magical effect) with a 1d6 Impact die. Burn a card per extra ingredient to step up Impact.',
      },
    ],
  },
  {
    id: 'hearthkeeper',
    name: 'Hearthkeeper',
    summary:
      'Baristas, tea makers, innkeepers, and chefs who keep cozy places alive — tending flames, filling bellies, and offering weary travelers rest.',
    proficiencies: ['strength', 'heart'],
    endurance: 6,
    protection: '1d4',
    abilities: [
      {
        name: "Hearth's Warmth",
        text: 'When establishing temporary shelter during a rest, forgo rest benefits and instead grant the group +2 on the next Check or +2 on the next Protection roll.',
      },
      {
        name: "Flamekeeper's Spark",
        text: 'Burn a card at any time to rekindle hope: you or an ally may reroll a Check once, even after failure is declared.',
      },
    ],
  },
  {
    id: 'honeywarden',
    name: 'Honeywarden',
    summary:
      'Caretaker of hives that hold secrets older than the Wildernight — steward of sweetness, pollination, and whispered nectar tales.',
    proficiencies: ['willpower', 'heart'],
    endurance: 8,
    protection: '1d8',
    abilities: [
      {
        name: "Hivekin's Bond",
        text: 'A loyal swarm accompanies you as a companion: warn of danger, fetch tiny things, and supply endless honey.',
      },
      {
        name: 'Smokescreen Veil',
        text: 'Burn a card to mask scent, presence, or intention within smoke; natural creatures cannot detect you and scent trails break until the smoke clears.',
      },
    ],
  },
  {
    id: 'rookwright',
    name: 'Rookwright',
    summary:
      'Tinkerers, clockmakers, and inventors of Nimm — artisans of motion who coax secrets from gears, glass, and scavenged Wildernight contraptions.',
    proficiencies: ['strength', 'willpower'],
    endurance: 5,
    protection: '1d6',
    abilities: [
      {
        name: 'Pocket Mechanica',
        text: 'Burn a card to open a mundane lock, repair a broken item, or activate an old machine with a multi-use clockwork tool.',
      },
      {
        name: 'Wright Instinct',
        text: 'Gain +2 on a Check when examining unfamiliar technology, disassembling machines, or intuiting ancient mechanisms.',
      },
    ],
  },
  {
    id: 'solweaver',
    name: 'Solweaver',
    summary:
      'Keeper of old remedies and quiet watcher of the boundary between life and death — wounds of body, heart, mind, and soul.',
    proficiencies: ['dexterity', 'heart'],
    endurance: 6,
    protection: '1d4',
    abilities: [
      {
        name: 'Soulstitch Ritual',
        text: 'Burn a card and perform a quiet ritual: a character or companion recovers 1d6 Endurance and ignores the next condition until the next rest.',
      },
      {
        name: 'Seams of Life',
        text: 'When touching a being, learn if they are cursed, close to death, or under magical influence, and whether harm is physical, mental, or magical.',
      },
    ],
  },
  {
    id: 'songheart',
    name: 'Songheart',
    summary:
      'Keepers of forgotten ballads and guardians of laughter — stitching stories into melody along twilight roads and village squares.',
    proficiencies: ['heart', 'dexterity'],
    endurance: 8,
    protection: '1d4',
    abilities: [
      {
        name: 'Echoes of the Notes',
        text: 'When you perform for others, ask one truthful question about whether someone is nervous, angry, excited, cursed, or betrayed (pairs as listed in the book).',
      },
      {
        name: 'Poetic Harmonization',
        text: 'Burn a card to copy a nearby being’s ability until the next rest, flavored by your music or motion.',
      },
    ],
  },
  {
    id: 'threadscribe',
    name: 'Threadscribe',
    summary:
      'Wayfinder and lore-keeper — charting Wildernight paths that twist like forgotten dreams and hunting glimpses of the Tapestry’s weave.',
    proficiencies: ['dexterity', 'willpower'],
    endurance: 8,
    protection: '1d4',
    abilities: [
      {
        name: 'Read the Weave',
        text: 'Burn a card to reduce Risk Rating by 1d4 until the next rest. If RR becomes negative (max −3), red cards revealed reduce DR instead.',
      },
      {
        name: 'Inked Tether',
        text: 'Immune to conditions related to being lost or misdirected.',
      },
    ],
  },
  {
    id: 'wanderlustian',
    name: 'Wanderlustian',
    summary:
      'Seeker of the unknown, spreader of news, chronicler of the road — drifting beacon to Wildernight path without quite getting lost.',
    proficiencies: ['heart', 'strength'],
    endurance: 6,
    protection: '1d8',
    abilities: [
      {
        name: 'Caravan Spirit',
        text: 'Burn a card to alter Attitude or Morale of a being by one step, positive or negative.',
      },
      {
        name: 'Familiar Stranger',
        text: 'Once per rest, automatically succeed at a social Check to gain entry, avoid suspicion, or blend into a community, gathering, or caravan.',
      },
    ],
  },
  {
    id: 'wildergarde',
    name: 'Wildergarde',
    summary:
      'Steward of nature’s balance on the Wildernight border — hunting, protecting Nimm’s food supply, and chasing fireside legends.',
    proficiencies: ['strength', 'dexterity'],
    endurance: 8,
    protection: '1d6',
    abilities: [
      {
        name: 'Helping Hand',
        text: 'Once per rest, add one of your Attribute dice to someone else’s Check. You do not gain cards or XP; Setback effects apply to you.',
      },
      {
        name: "Seeker's Passage",
        text: 'Burn a card to reveal hidden tracks, trails, or evidence and gain +2 on your next Check related to pursuit, escape, or difficult terrain.',
      },
    ],
  },
];

export function getMuscadinesBackground(nameOrId: string): MuscadinesBackground | undefined {
  const key = nameOrId.trim().toLowerCase();
  return muscadinesBackgrounds.find(
    (bg) => bg.id === key || bg.name.toLowerCase() === key,
  );
}

export const backgroundNameOptions = muscadinesBackgrounds.map((bg) => bg.name);
