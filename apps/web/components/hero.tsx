import { HeroDice } from '@/components/hero-dice';
import Link from 'next/link';

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
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Local-first · Offline-ready
          </p>

          <h1
            data-testid="landing-hero"
            className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-7xl"
          >
            Your table,{' '}
            <span className="bg-gradient-to-r from-codex-ember via-codex-ember-bright to-codex-ember bg-clip-text text-transparent animate-shimmer">
              anywhere
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Dice, oracles, character sheets, and interactive maps — built for solo journeys
            and shared campaigns alike. Works offline. Syncs when you&apos;re back.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/dice"
              className="codex-glow rounded-full bg-primary px-8 py-3.5 text-center text-base font-medium text-primary-foreground transition-transform motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              Roll your first die
            </Link>
            <Link
              href="/play"
              className="rounded-full border border-border px-8 py-3.5 text-center text-base font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Open a table
            </Link>
          </div>
        </div>

        <HeroDice />
      </div>
    </section>
  );
}
