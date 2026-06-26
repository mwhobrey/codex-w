function FeatureIcon({ name }: { name: string }) {
  const className = 'h-6 w-6 text-primary';

  switch (name) {
    case 'dice':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2 20 7v10l-8 5-8-5V7l8-5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'sheet':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'map':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m3 6 7-3 7 3 4-2v15l-4 2-7-3-7 3V6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 3v15M17 6v15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'offline':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 20a8 8 0 1 0-8-8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M4 12H2M6.3 6.3 4.9 4.9M12 4V2M17.7 6.3l1.4-1.4M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m16 16-8-8M8 16l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'solo':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 1.5-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'plugin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

const features = [
  {
    icon: 'dice' as const,
    title: 'Dice & Oracles',
    description:
      'Parse any notation, roll with crypto-grade RNG, resolve oracle tables — especially tuned for solo play.',
  },
  {
    icon: 'sheet' as const,
    title: 'Character Sheets',
    description:
      'System-aware sheets via plugins. Edit offline, sync when connected. Your character, your data.',
  },
  {
    icon: 'map' as const,
    title: 'Interactive Maps',
    description:
      'Infinite canvas VTT powered by Excalidraw. Stamp terrain, sketch scenes — collaborate in real time or work alone.',
  },
  {
    icon: 'offline' as const,
    title: 'Online & Offline',
    description:
      'Local-first architecture. Play in a dead zone, sync when you surface. No cloud required for solo.',
  },
  {
    icon: 'solo' as const,
    title: 'Solo to Squad',
    description:
      'One app for lonely nights and full tables. Hosted GM mode, peer play, or just you and the oracle.',
  },
  {
    icon: 'plugin' as const,
    title: 'Game System Plugins',
    description:
      'Loner, TOTV, Snallygaster, Ironforge — each system ships as a first-class module, not an afterthought.',
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-codex-border/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight text-codex-text md:text-4xl">
            Everything at the table
          </h2>
          <p className="mt-4 text-codex-text-muted">
            One toolkit, no tab-hopping. Built modern, built fast, built to last through a
            three-hour boss fight.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group rounded-2xl border border-codex-border bg-codex-surface p-6 transition-colors hover:border-codex-ember/30 hover:bg-codex-elevated"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-codex-ember/20 bg-codex-elevated/60">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className="mt-4 font-medium text-codex-text">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-codex-text-muted">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
