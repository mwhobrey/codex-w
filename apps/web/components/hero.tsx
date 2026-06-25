import { DieFace } from '@/components/dice/die-face';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, var(--codex-glow-strong) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-codex-border bg-codex-elevated/50 px-4 py-1.5 text-xs font-medium tracking-wide text-codex-text-muted uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-codex-success animate-pulse" />
            Local-first · Offline-ready
          </p>

          <h1
            data-testid="landing-hero"
            className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-codex-text sm:text-5xl md:text-7xl"
          >
            Your table,{' '}
            <span className="bg-gradient-to-r from-codex-ember via-codex-ember-bright to-codex-ember bg-clip-text text-transparent animate-shimmer">
              anywhere
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-codex-text-muted sm:text-lg md:text-xl">
            Dice, oracles, character sheets, and interactive maps — built for solo journeys
            and shared campaigns alike. Works offline. Syncs when you&apos;re back.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="/dice"
              className="codex-glow rounded-full bg-codex-ember px-8 py-3.5 text-center text-base font-medium text-codex-void transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Roll your first die
            </a>
            <a
              href="/play"
              className="rounded-full border border-codex-border px-8 py-3.5 text-center text-base font-medium text-codex-text transition-colors hover:border-codex-ember/50 hover:text-codex-ember"
            >
              Open a table
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-16 flex justify-center sm:mt-20" aria-hidden>
          <div className="animate-float flex items-end gap-3 sm:gap-5">
            <DieFace value={20} sides={20} size="sm" />
            <DieFace value={6} sides={6} size="md" />
            <DieFace value={10} sides={10} size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
