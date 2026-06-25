import type { PromptEntry } from '../types';

/**
 * Original prompt journal inspired by TYOV's structure (memories, erosion, diary play).
 * All text is codex-w authored — not reproduced from Tim Hutchings' book.
 */
export const totvPrompts: PromptEntry[] = [
  { id: 1, tags: ['origin'], text: 'Write three fragments of your mortal childhood — smells, sounds, or a single face.', hint: 'Fills memory space' },
  { id: 2, tags: ['origin'], text: 'Where were you born, and what did the horizon look like from there?' },
  { id: 3, tags: ['origin'], text: 'Who taught you your first trade or talent before the turning?' },
  { id: 4, tags: ['origin'], text: 'Describe the night you stopped being human. What broke first — body or belief?' },
  { id: 5, tags: ['bond'], text: 'Name someone who loved you while you still aged. What promise did you make them?' },
  { id: 6, tags: ['gain'], text: 'Add a skill you learned in your first lonely century.', hint: 'Up to five skills on your sheet' },
  { id: 7, tags: ['gain'], text: 'Claim a resource you still protect — a house, hoard, relic, or refuge.', hint: 'Up to five resources' },
  { id: 8, tags: ['bond'], text: 'Introduce a mortal or monster who keeps pulling you back into the world.', hint: 'Up to five characters' },
  { id: 9, tags: ['diary'], text: 'Write a diary stanza about hunger — what you crave that blood cannot give.' },
  { id: 10, tags: ['gain'], text: 'Record a memory of beauty that survived the turning.', hint: 'Five memory slots; three moments each' },
  { id: 11, tags: ['bond'], text: 'A letter arrives decades late. Who wrote it, and what do they still believe about you?' },
  { id: 12, tags: ['loss'], text: 'You need room for something new. Strike a memory until only ash remains.', hint: 'Remove or compress a memory slot' },
  { id: 13, tags: ['loss'], text: 'A skill atrophies from disuse. Cross it out and name what replaced it in your life.' },
  { id: 14, tags: ['loss'], text: 'Spend a resource desperately. What did it buy, and who noticed the waste?' },
  { id: 15, tags: ['bond'], text: 'Someone you cherished forgets your face. How do you prove you existed?' },
  { id: 16, tags: ['diary'], text: 'Write about a war you watched from the edges. Whose side did you pretend to take?' },
  { id: 17, tags: ['gain'], text: 'Adopt a new name the world gives you. Why do you accept or reject it?' },
  { id: 18, tags: ['bond'], text: 'A fledgling asks for guidance. What lie do you tell them for their own good?' },
  { id: 19, tags: ['loss'], text: 'An old enemy dies of time, not your hand. What do you do with the victory?' },
  { id: 20, tags: ['diary'], text: 'Describe a century you barely remember. What feeling lingers without facts?' },
  { id: 21, tags: ['gain'], text: 'Discover an art form born after your turning. Which piece undoes you?' },
  { id: 22, tags: ['bond'], text: 'A mortal saves you without knowing what you are. Do you repay them — and how?' },
  { id: 23, tags: ['loss'], text: 'Lose a character from your sheet: they move on, die, or refuse you.', hint: 'Clear a character slot' },
  { id: 24, tags: ['diary'], text: 'Write about the loneliest feast you ever attended.' },
  { id: 25, tags: ['gain'], text: 'Claim a territory — a district, ruin, or stretch of coast. What rules do you enforce?' },
  { id: 26, tags: ['bond'], text: 'Two people you care for collide. Whose pain do you choose to witness?' },
  { id: 27, tags: ['loss'], text: 'Forget a skill on purpose to learn something monstrous. Name the trade-off.' },
  { id: 28, tags: ['diary'], text: 'A religion rises that would call you demon. How do you hide among its hymns?' },
  { id: 29, tags: ['bond'], text: 'Someone photographs you without consent. What does the image reveal?' },
  { id: 30, tags: ['loss'], text: 'Your last link to your birthplace is demolished. Salvage one detail before it vanishes.' },
  { id: 31, tags: ['gain'], text: 'Forge a new resource out of patience — an investment that finally matures.' },
  { id: 32, tags: ['diary'], text: 'Write a confession you will never send.' },
  { id: 33, tags: ['bond'], text: 'A child shows you mercy. What do you do with that unbearable gift?' },
  { id: 34, tags: ['loss'], text: 'Erase a happy memory to keep a darker one sharp. Why is the dark worth more?' },
  { id: 35, tags: ['diary'], text: 'Describe the world one hundred years from now as you hope it will be — not as you expect.' },
  { id: 36, tags: ['reflect'], text: 'You are still here. What tiny, stubborn reason keeps you from ending the story?' },
];
