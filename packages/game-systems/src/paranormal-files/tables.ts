/**
 * Paranormal Files chargen + shadow-ops tables (CC BY-SA SRD).
 * See ../NOTICE
 */

import type { FactionDefinition, OracleTableEntry, UnknownThresholdDelta } from '../types';

/** Flatten a 6×6 d66 grid into catalog rows (roll 11–66). */
export function flattenD66(grid: string[][]): { roll: number; text: string }[] {
  const rows: { roll: number; text: string }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      rows.push({ roll: (r + 1) * 10 + (c + 1), text: grid[r]![c]! });
    }
  }
  return rows;
}

export function rollD66Entry(grid: string[][], tens: number, ones: number): string {
  const r = Math.max(1, Math.min(6, Math.round(tens))) - 1;
  const c = Math.max(1, Math.min(6, Math.round(ones))) - 1;
  return grid[r]![c]!;
}

export const pfConceptGrid: string[][] = [
  [
    'Cynical Agent',
    'Occult Researcher',
    'Rogue Psychic',
    'Tech-Savvy Analyst',
    'Disillusioned Veteran',
    'Ex-Field Operative',
  ],
  [
    'Conspiracy Theorist',
    'Debunker',
    'Cold-Case Detective',
    'Embedded Journalist',
    'Cryptid Hunter',
    'Augmented Escapee',
  ],
  [
    'Government Asset',
    'Black-Ops Cleaner',
    'Paranormal Archivist',
    'Experimental Subject',
    'Remote Viewer',
    'Field Anthropologist',
  ],
  [
    'Bureaucratic Handler',
    'Residual Medium',
    'Trauma-Hardened Survivor',
    'Anomalous Tech Engineer',
    'Cult Defector',
    'Corporate Espionage Expert',
  ],
  [
    'Ritualist Operative',
    'Experimental Engineer',
    'Interdimensional Wanderer',
    'Whistleblower',
    'Containment Specialist',
    'Contact Specialist',
  ],
  [
    'Alien Abductee',
    'Psychological Warfare Expert',
    'Compromised Operative',
    'Reality Bender',
    'Host of an Unknown Entity',
    'Shadow Operative',
  ],
];

export const pfSkillGrid: string[][] = [
  [
    'Cryptography',
    'Lockpicking',
    'Spot Weakness',
    'Counter-Surveillance',
    'Anomaly Calibration',
    'Paranormal Detection',
  ],
  [
    'Forensic Analysis',
    'Reverse Engineering',
    'Fast Talk',
    'Lie Detection',
    'Occult Knowledge',
    'Danger Assessment',
  ],
  [
    'Firearms Training',
    'Close-Quarters Combat',
    'Focused Willpower',
    'Artifact Appraisal',
    'Systems Intrusion',
    'Biohazard Containment',
  ],
  [
    'Tactical Driving',
    'Signal Interception',
    'Breaking & Entering',
    'Rift Sensing',
    'Psychological Control',
    'Data Fabrication',
  ],
  [
    'Hypnotic Induction',
    'Remote Viewing',
    'Improvised Problem-Solving',
    'Memory Suppression',
    'Field Medicine',
    'Network Exploitation',
  ],
  [
    'Ritual Execution',
    'Arcane Symbology',
    'Scientific Deduction',
    'Espionage Protocols',
    'Cryptid Tracking',
    'Cult Infiltration',
  ],
];

export const pfFrailtyGrid: string[][] = [
  [
    'Paranoia',
    'Unresolved Trauma',
    'Hallucination-Prone',
    'Chemical Dependency',
    'Haunted by a Past Case',
    'Fragmented Memory',
  ],
  [
    'Unstable Psyche',
    'Bound to a Foreign Will',
    'Distorted Perception',
    'Memory Blackouts',
    'Misplaced Trust',
    'Defiance Toward Authority',
  ],
  [
    'Physically Scarred',
    'Secretly Compromised',
    'Vulnerable to Influence',
    'Fear of the Dark',
    'Triggered Flashbacks',
    'Chronic Bleeding',
  ],
  [
    'Obsessive Curiosity',
    'Recurring Nightmares',
    'Dissociative Episodes',
    'Fear of Silence',
    'Cursed Luck',
    'Anomalous Allergy',
  ],
  [
    'Emotional Numbness',
    'Temporal Flashbacks',
    'Missing Time',
    'Under Surveillance',
    'Failing Health',
    'Psychic Vulnerability',
  ],
  [
    'Oathbound',
    'Reality Drift',
    'Compelled by an Unknown',
    'Propaganda Susceptibility',
    'Incapable of Deception',
    'Neurological Instability',
  ],
];

export const pfGearGrid: string[][] = [
  [
    'EMP Disruptor',
    'Night-Vision Mod Goggles',
    'Prototype Firearm',
    'Anomaly Scanner',
    'Thermal-Resistant Suit',
    'Encrypted Data Vault',
  ],
  [
    'Psychometric Glove',
    'Signal-Scrambling Earpiece',
    'Concealed Weapon',
    'Self-Mending Notebook',
    'Biometric Cloak',
    'Dimensional Tether',
  ],
  [
    'Containment Box',
    'EMF Tracker',
    'Classified Dossier',
    'Reality Stabilizer',
    'Tranquilizer Injector',
    'Memory-Wipe Ampoule',
  ],
  [
    'Satellite Uplink Phone',
    'Precision Lockpicks',
    'Quantum Cipher Key',
    'Portable Ritual Altar',
    'Paranormal Signal Receiver',
    'Adaptive Cloaking Field',
  ],
  [
    'Digital Obfuscator',
    'X-Ray Scope',
    'Sigil Pendant',
    'Voice-Shifting Recorder',
    'Forged Bureau Access Card',
    'Cognitive Interface Module',
  ],
  [
    'UV-Edged Blade',
    'Psychic Resonance Shield',
    'Ritual Marking Kit',
    'Neural Disruptor',
    'Anti-Possession Serum',
    'Redacted Journal (Unreadable Sections)',
  ],
];

export const UNKNOWN_THRESHOLD_MAX = 6;

export const unknownThresholdDeltas: UnknownThresholdDelta[] = [
  { label: 'Yes, and...', description: 'You stay grounded — clarity returns.', delta: -1 },
  { label: 'Yes', description: 'You endure. The moment passes.', delta: 0 },
  { label: 'Yes, but...', description: 'You push through, but feel the strain.', delta: 1 },
  { label: 'No, but...', description: 'Something bends. Subtle, but real.', delta: 2 },
  { label: 'No', description: 'The anomaly leaves a mark.', delta: 3 },
  { label: 'No, and...', description: 'The world around you fractures.', delta: 4 },
];

export const realityFractureTable: OracleTableEntry[] = [
  {
    roll: 1,
    text: 'Echoes of the Unseen — Distant voices whisper; warnings, recordings, or unraveling thoughts.',
  },
  {
    roll: 2,
    text: 'Dimensional Bleed — The environment flickers; for a few seconds it is somewhere else — and so are you.',
  },
  {
    roll: 3,
    text: 'Lost Time — You come to with no memory of what just happened. Something around you is off.',
  },
  {
    roll: 4,
    text: 'Cognitive Drift — Names and facts slip; you remember things that never happened — or haven’t yet.',
  },
  {
    roll: 5,
    text: 'Marked by the Unknown — An anomaly has noticed you — and may recognize you again.',
  },
  {
    roll: 6,
    text: 'The Door Opens — A breach forms. Something steps through, or you fall in.',
  },
];

export const pfFactions: FactionDefinition[] = [
  { id: 'black-sigil', name: 'The Black Sigil', concept: 'Covert Occultists' },
  { id: 'sentinels', name: 'The Sentinels of the Veil', concept: 'Unyielding Protectors' },
  { id: 'horizon', name: 'The Horizon Initiative', concept: 'Idealistic Researchers' },
  { id: 'hollow-sun', name: 'The Hollow Sun', concept: 'Apocalyptic Cultists' },
  { id: 'phantom', name: 'The Phantom Division', concept: 'Ghosts in the System' },
  { id: 'lazarus', name: 'The Lazarus Accord', concept: 'Resurrected Operatives' },
];

export function thresholdDeltaForLabel(label: string): number {
  const row = unknownThresholdDeltas.find((d) => d.label === label);
  return row?.delta ?? 0;
}

export function applyUnknownThreshold(
  current: number,
  label: string,
  max = UNKNOWN_THRESHOLD_MAX,
): { next: number; fracture: boolean } {
  const delta = thresholdDeltaForLabel(label);
  const next = Math.max(0, Math.min(max, current + delta));
  return { next, fracture: next >= max };
}
