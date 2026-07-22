/** Core Ironsworn moves — abbreviated from the Ironsworn SRD (CC BY 4.0). See NOTICE. */

export type IronswornStatId = 'edge' | 'heart' | 'iron' | 'shadow' | 'wits' | 'any';

export interface IronswornMove {
  id: string;
  name: string;
  category: 'adventure' | 'relationship' | 'combat' | 'suffer' | 'quest' | 'fate';
  /** Preferred or typical stats; player still chooses when fiction allows. */
  stats: IronswornStatId[];
  trigger: string;
  strong: string;
  weak: string;
  miss: string;
}

export const ironswornCoreMoves: IronswornMove[] = [
  {
    id: 'face-danger',
    name: 'Face Danger',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    trigger: 'When you attempt something risky or react to an imminent threat…',
    strong: 'You are successful. Take +1 momentum.',
    weak: 'You succeed, but face a troubling cost or complication. Choose one: you are delayed/disadvantaged; something of value is lost or broken; others face complications; or you face an unforeseen danger.',
    miss: 'You fail, or your progress is undermined. Pay the Price.',
  },
  {
    id: 'secure-an-advantage',
    name: 'Secure an Advantage',
    category: 'adventure',
    stats: ['edge', 'heart', 'iron', 'shadow', 'wits'],
    trigger: 'When you assess a situation, make preparations, or leverage expertise…',
    strong: 'You gain advantage. Choose one: take +2 momentum; or add +1 on your next move (not a progress move).',
    weak: 'Your advantage is short-lived. Take +1 momentum.',
    miss: 'You fail or your assumptions betray you. Pay the Price.',
  },
  {
    id: 'gather-information',
    name: 'Gather Information',
    category: 'adventure',
    stats: ['wits'],
    trigger: 'When you search an area, ask questions, investigate, or follow a track…',
    strong: 'You discover something helpful and specific. The path forward is clear. Take +2 momentum.',
    weak: 'The information complicates your quest or introduces a new danger. Take +1 momentum.',
    miss: 'Your investigation unearths a dire threat or true nature of your quarry. Pay the Price.',
  },
  {
    id: 'heal',
    name: 'Heal',
    category: 'adventure',
    stats: ['wits', 'iron'],
    trigger: 'When you treat wounds or aid someone as they recover…',
    strong: 'Your care is helpful. If you (or the ally) have the wounded condition cleared when appropriate, take +2 health.',
    weak: 'As above, but you must suffer -1 supply.',
    miss: 'Your aid is ineffective. Pay the Price.',
  },
  {
    id: 'resupply',
    name: 'Resupply',
    category: 'adventure',
    stats: ['wits'],
    trigger: 'When you hunt, forage, or scavenge…',
    strong: 'You succeed. Take +2 supply.',
    weak: 'You must first deal with a cost or complication. Once you overcome it, take +1 supply.',
    miss: 'You find nothing helpful. Pay the Price.',
  },
  {
    id: 'make-camp',
    name: 'Make Camp',
    category: 'adventure',
    stats: ['heart'],
    trigger: 'When you rest and recover while traveling…',
    strong: 'Your rest is beneficial. Choose two benefits (heal, prepare, relax, focus — per SRD).',
    weak: 'As above, but choose one.',
    miss: 'You take no comfort. Pay the Price.',
  },
  {
    id: 'undertake-a-journey',
    name: 'Undertake a Journey',
    category: 'adventure',
    stats: ['wits'],
    trigger: 'When you travel across perilous terrain…',
    strong: 'You reach a waypoint. Mark progress and choose: take +1 momentum, or suffer -1 supply and mark progress again.',
    weak: 'Reach a waypoint and mark progress, then suffer -1 supply.',
    miss: 'You are waylaid. Pay the Price.',
  },
  {
    id: 'compel',
    name: 'Compel',
    category: 'relationship',
    stats: ['heart', 'iron', 'shadow'],
    trigger: 'When you attempt to persuade someone through social interaction…',
    strong: 'They’ll do what you want or share what they know. Take +1 momentum. If gathering information next, add +1.',
    weak: 'As above, but they ask something of you first.',
    miss: 'They refuse or make a demand that costs you. Pay the Price.',
  },
  {
    id: 'sojourn',
    name: 'Sojourn',
    category: 'relationship',
    stats: ['heart'],
    trigger: 'When you spend time in a community seeking aid…',
    strong: 'You find assistance. Take +2 momentum and choose two recoveries (clear a condition, recover a meter, etc.).',
    weak: 'Take +1 momentum and choose one.',
    miss: 'You find no help. Pay the Price.',
  },
  {
    id: 'forge-a-bond',
    name: 'Forge a Bond',
    category: 'relationship',
    stats: ['heart'],
    trigger: 'When you spend significant time with a person or community, share kinship and sacrifice, and seek lasting connection…',
    strong: 'The bond is forged. Mark a bond and take +2 momentum.',
    weak: 'There is still more to do, or they ask something of you first.',
    miss: 'You are rejected. Clear any related vow progress and pay the Price.',
  },
  {
    id: 'swear-an-iron-vow',
    name: 'Swear an Iron Vow',
    category: 'quest',
    stats: ['heart'],
    trigger: 'When you swear upon iron to complete a quest…',
    strong: 'You are emboldened and know what you must do. Take +2 momentum.',
    weak: 'You are determined but begin your quest with more questions than answers. Take +1 momentum and envision what you must learn.',
    miss: 'You face a significant obstacle before you even begin. Pay the Price and envision how you begin despite this hardship.',
  },
  {
    id: 'fulfill-your-vow',
    name: 'Fulfill Your Vow',
    category: 'quest',
    stats: ['any'],
    trigger: 'When you achieve what you believe to be the fulfillment of your vow, roll progress (progress score vs 2d10)…',
    strong: 'Your quest is complete. Mark XP (by rank) and decide how this changes your character/world.',
    weak: 'There is more to be done or you realize the truth of your quest. Mark XP (one less than full) and swear an iron vow to resolve unfinished business (or abandon it).',
    miss: 'Your quest is failed. Suffer -XP equal to the rank (min 1) and Pay the Price.',
  },
  {
    id: 'enter-the-fray',
    name: 'Enter the Fray',
    category: 'combat',
    stats: ['heart', 'shadow', 'wits'],
    trigger: 'When you enter into combat…',
    strong: 'Take +2 momentum. You have initiative.',
    weak: 'Take +1 momentum. You have initiative.',
    miss: 'Combat begins with you at a disadvantage. Pay the Price. Your foe has initiative.',
  },
  {
    id: 'strike',
    name: 'Strike',
    category: 'combat',
    stats: ['edge', 'iron'],
    trigger: 'When you have initiative and attack…',
    strong: 'Inflict +1 harm and take +1 momentum. You retain initiative.',
    weak: 'Inflict your harm and lose initiative.',
    miss: 'Your attack fails and you must Pay the Price. Your foe has initiative.',
  },
  {
    id: 'clash',
    name: 'Clash',
    category: 'combat',
    stats: ['edge', 'iron'],
    trigger: 'When your foe has initiative and you fight back…',
    strong: 'Inflict your harm and take +1 momentum. You gain initiative.',
    weak: 'Inflict your harm and lose initiative; or, if you choose, inflict no harm but take initiative (and Pay the Price for the exchange).',
    miss: 'You are overpowered. Pay the Price. Your foe retains initiative.',
  },
  {
    id: 'endure-harm',
    name: 'Endure Harm',
    category: 'suffer',
    stats: ['iron'],
    trigger: 'When you face physical damage…',
    strong: 'Shake it off. If health > 0 you may suffer -1 momentum in exchange for +1 health after marking harm.',
    weak: 'Press on. You may suffer -1 momentum to avoid marking wounded (when applicable).',
    miss: 'You are beaten. Mark wounded (if health is 0) or face a dramatic physical cost. Also Pay the Price.',
  },
  {
    id: 'endure-stress',
    name: 'Endure Stress',
    category: 'suffer',
    stats: ['heart'],
    trigger: 'When you face mental shock or despair…',
    strong: 'As Endure Harm, but for spirit / shaken.',
    weak: 'As Endure Harm weak, for spirit.',
    miss: 'You break. Mark shaken (if spirit is 0) or face a dramatic emotional cost. Pay the Price.',
  },
  {
    id: 'ask-the-oracle',
    name: 'Ask the Oracle',
    category: 'fate',
    stats: ['any'],
    trigger: 'When you seek guidance from the dice to spark ideas or resolve uncertainty…',
    strong: 'Use yes/no likelihoods, Action + Theme, or other oracle tables — then interpret.',
    weak: '—',
    miss: '—',
  },
];

export function getIronswornMove(id: string): IronswornMove | undefined {
  return ironswornCoreMoves.find((move) => move.id === id);
}
