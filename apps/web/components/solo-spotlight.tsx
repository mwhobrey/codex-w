import Link from 'next/link';

const SPOTLIGHT = [
  {
    id: 'loner',
    name: 'Loner',
    href: '/play?system=loner',
    description: 'Tags and Chance/Risk Oracle — twists, Luck, and emergent stories.',
  },
  {
    id: 'paranormal-files',
    name: 'Loner: Paranormal Files',
    href: '/play?system=paranormal-files',
    description: 'Agents and anomalies — Unknown Threshold, factions, redacted cases.',
  },
  {
    id: 'totv',
    name: 'Thousand Year Old Vampire',
    href: '/play?system=totv',
    description: 'Original prompt journal — memories, Marks, centuries. Book-compatible structure.',
  },
  {
    id: 'snallygaster',
    name: 'Camp Snallygaster',
    href: '/play?system=snallygaster',
    description: 'PATH solo loop — Skill, Counselor & Monster, five days of camp horror.',
  },
  {
    id: 'muscadines',
    name: 'Midnight Muscadines',
    href: '/play?system=muscadines',
    description: 'Cozy-dark folklore — mentor prompts and oracles. Live now.',
  },
  {
    id: 'ironsworn',
    name: 'Ironsworn',
    href: '/play?system=ironsworn',
    description: 'Iron vows, action rolls, and oracles in the Ironlands (CC BY).',
  },
];

export function SoloSpotlight() {
  return (
    <section id="solo" className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-24 sm:px-6">
      <h2 className="font-display text-2xl font-medium text-foreground">Solo systems</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SPOTLIGHT.map((system) => (
          <li key={system.id}>
            <Link
              href={system.href}
              className="group block h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="font-display text-lg text-foreground group-hover:text-primary">
                {system.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{system.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
