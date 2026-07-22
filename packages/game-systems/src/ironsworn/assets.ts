/** Ironsworn asset text — derived from the Ironsworn SRD (CC BY 4.0). See NOTICE. */

export type IronswornAssetType = 'path' | 'companion' | 'combat-talent' | 'ritual';

export interface IronswornAssetAbility {
  id: string;
  text: string;
  /** Starting assets usually unlock the first ability. */
  starting?: boolean;
}

export interface IronswornAsset {
  id: string;
  name: string;
  type: IronswornAssetType;
  summary: string;
  abilities: IronswornAssetAbility[];
}

export const ironswornAssets: IronswornAsset[] = [
  {
    id: 'path-herbalist',
    name: 'Herbalist',
    type: 'path',
    summary: 'When you treat with plants or Heal using herbal remedies…',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you use Heal and have enough herbs on hand, add +1; on a hit take +1 health more.',
      },
      { id: 'a2', text: 'When you Gather Information by studying flora or using herbal lore, add +1.' },
      { id: 'a3', text: 'When you Heal a companion and score a strong hit, also take +1 spirit.' },
    ],
  },
  {
    id: 'path-outcast',
    name: 'Outcast',
    type: 'path',
    summary: 'You are apart from settled communities.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Resupply by scavenging or foraging alone, add +1 and take +1 momentum on a strong hit.',
      },
      { id: 'a2', text: 'When you Secure an Advantage or Face Danger using stealth or solitude (+shadow), add +1.' },
      { id: 'a3', text: 'When you Sojourn and roll a miss, you may press on without paying the usual price once per sojourn — but mark your isolation in the fiction.' },
    ],
  },
  {
    id: 'path-sighted',
    name: 'Sighted',
    type: 'path',
    summary: 'You perceive omens and patterns others miss.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Gather Information or Secure an Advantage by reading signs, add +1.',
      },
      { id: 'a2', text: 'When you Ask the Oracle for insight into a mystery, you may reroll any oracle die once.' },
      { id: 'a3', text: 'When you Face Danger +wits against supernatural dread, add +1 and take +1 spirit on a strong hit.' },
    ],
  },
  {
    id: 'path-wildblood',
    name: 'Wildblood',
    type: 'path',
    summary: 'You move through wild places as if born to them.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Face Danger or Secure an Advantage in the wilds (+edge or +wits), add +1.',
      },
      { id: 'a2', text: 'When you Undertake a Journey through wilderness, add +1.' },
      { id: 'a3', text: 'When you Make Camp in the wild, you may take an additional recover option on a hit.' },
    ],
  },
  {
    id: 'companion-hound',
    name: 'Hound',
    type: 'companion',
    summary: 'Your loyal hound. Companion health track (4).',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'Your hound is your eyes and ears. When you Gather Information using its senses, add +1; on a strong hit take +1 momentum.',
      },
      { id: 'a2', text: 'When you Strike or Clash alongside your hound, inflict +1 harm; on a miss your hound Endures Harm.' },
      { id: 'a3', text: 'When you Endure Stress in the presence of your hound, add +1.' },
    ],
  },
  {
    id: 'companion-hawk',
    name: 'Hawk',
    type: 'companion',
    summary: 'A keen-eyed hawk. Companion health track (3).',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Undertake a Journey and send your hawk to scout, add +1; on a strong hit take +1 momentum.',
      },
      { id: 'a2', text: 'When you Secure an Advantage +wits by surveying from above (via your hawk), add +1 and take +1 momentum on a hit.' },
      { id: 'a3', text: 'When you Strike by directing your hawk, roll +wits; on a strong hit inflict +1 harm.' },
    ],
  },
  {
    id: 'combat-slinger',
    name: 'Slinger',
    type: 'combat-talent',
    summary: 'You fight with a sling or thrown weapon.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Strike or Clash by throwing, add +1; on a strong hit take +1 momentum.',
      },
      { id: 'a2', text: 'When you Face Danger by making a precise throw (+edge), add +1.' },
      { id: 'a3', text: 'When you Secure an Advantage by pelting a foe or creating a distraction, add +1 and take +2 momentum on a strong hit.' },
    ],
  },
  {
    id: 'combat-swordmaster',
    name: 'Swordmaster',
    type: 'combat-talent',
    summary: 'You are trained in the blade.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Strike or Clash in close quarters with a blade, add +1.',
      },
      { id: 'a2', text: 'When you Secure an Advantage by studying a foe’s fighting style, add +1; on a strong hit take +1 momentum.' },
      { id: 'a3', text: 'When you Turn the Tide by leveraging blade skill, take +1 momentum more on a hit.' },
    ],
  },
  {
    id: 'ritual-augury',
    name: 'Augur',
    type: 'ritual',
    summary: 'You cast bones, cards, or omens to seek guidance.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Secure an Advantage or Gather Information by performing a ritual of augury, add +1.',
      },
      { id: 'a2', text: 'When you Ask the Oracle after an augury, you may roll twice and choose.' },
      { id: 'a3', text: 'When you Swear an Iron Vow after reading omens, take +1 momentum more on a hit.' },
    ],
  },
  {
    id: 'ritual-bind',
    name: 'Bind',
    type: 'ritual',
    summary: 'You weave wards and bindings.',
    abilities: [
      {
        id: 'a1',
        starting: true,
        text: 'When you Face Danger or Secure an Advantage by binding a force or spirit, add +1.',
      },
      { id: 'a2', text: 'When you Compel through ritual binding, add +1; on a miss the binding backlashes — Endure Stress.' },
      { id: 'a3', text: 'When you Forge a Bond sealed with a binding ritual, take +1 momentum more on a strong hit.' },
    ],
  },
];

export function getIronswornAsset(id: string): IronswornAsset | undefined {
  return ironswornAssets.find((asset) => asset.id === id);
}

export function parseAssetIds(raw: string): string[] {
  return raw
    .split(/[,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
