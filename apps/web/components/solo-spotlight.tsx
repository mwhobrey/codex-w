import Link from 'next/link';

const SPOTLIGHT = [
  {
    id: 'loner',
    name: 'Loner',
    status: 'MVP' as const,
    href: '/play?system=loner',
    description: 'Oracle play — risky questions, sharp twists. Live now.',
  },
  {
    id: 'totv',
    name: 'Thousand Year Old Vampire',
    status: 'MVP' as const,
    href: '/play?system=totv',
    description: 'Prompt journal — d10−d6 navigation, fading memories. Live now.',
  },
  {
    id: 'snallygaster',
    name: 'Camp Snallygaster',
    status: 'MVP' as const,
    href: '/play?system=snallygaster',
    description: 'Summer camp horror — counselor & monster rolls. Live now.',
  },
  {
    id: 'muscadines',
    name: 'Midnight Muscadines',
    status: 'MVP' as const,
    href: '/play?system=muscadines',
    description: 'Cozy-dark folklore — mentor prompts and oracles. Live now.',
  },
  {
    id: 'ironforge',
    name: 'Ironforge',
    status: 'MVP' as const,
    href: '/play?system=ironforge',
    description: 'Grim industrial survival — oath track, forge rolls, hazards. Live now.',
  },
];

export function SoloSpotlight() {
  return (
    <section className="mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-medium text-codex-text">Solo systems</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SPOTLIGHT.map((system) => (
          <li key={system.id}>
            <Link
              href={system.href}
              className="group block h-full rounded-2xl border border-codex-border bg-codex-surface p-5 transition-colors hover:border-codex-ember/40"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg text-codex-text group-hover:text-codex-ember">
                  {system.name}
                </h3>
                <span className="rounded-full bg-codex-ember/15 px-2 py-0.5 text-[10px] font-medium uppercase text-codex-ember">
                  {system.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-codex-text-muted">{system.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
