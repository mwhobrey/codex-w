const features = [
  {
    icon: '🎲',
    title: 'Dice & Oracles',
    description:
      'Parse any notation, roll with crypto-grade RNG, resolve oracle tables — especially tuned for solo play.',
  },
  {
    icon: '📜',
    title: 'Character Sheets',
    description:
      'System-aware sheets via plugins. Edit offline, sync when connected. Your character, your data.',
  },
  {
    icon: '🗺️',
    title: 'Interactive Maps',
    description:
      'Infinite canvas VTT powered by Excalidraw. Stamp terrain, sketch scenes — collaborate in real time or work alone.',
  },
  {
    icon: '📡',
    title: 'Online & Offline',
    description:
      'Local-first architecture. Play in a dead zone, sync when you surface. No cloud required for solo.',
  },
  {
    icon: '👥',
    title: 'Solo to Squad',
    description:
      'One app for lonely nights and full tables. Hosted GM mode, peer play, or just you and the oracle.',
  },
  {
    icon: '🔌',
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
              <span className="text-2xl" aria-hidden>
                {feature.icon}
              </span>
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
