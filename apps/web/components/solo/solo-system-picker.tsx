'use client';

import { listSoloSystems } from '@codex/game-systems';
import Link from 'next/link';

export function SoloSystemPicker() {
  const systems = listSoloSystems();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <h1 className="font-display text-4xl font-medium tracking-tight text-codex-text">
          Open a table
        </h1>
        <p className="mt-3 text-codex-text-muted">
          Pick a system. Solo or shared — same link, same map, works offline.
        </p>
      </div>

      <ul className="mt-12 space-y-4">
        {systems.map((system) => (
          <li key={system.id}>
            <Link
              href={`/play?system=${system.id}`}
              className="group block rounded-2xl border border-codex-border bg-codex-surface p-6 transition-colors hover:border-codex-ember/40 hover:bg-codex-elevated"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-medium text-codex-text group-hover:text-codex-ember">
                    {system.name}
                  </h2>
                  <p className="mt-2 text-sm text-codex-text-muted">{system.tagline}</p>
                </div>
                <span className="shrink-0 rounded-full bg-codex-ember/15 px-3 py-1 text-xs font-medium text-codex-ember">
                  Play
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-sm text-codex-text-faint">
        Generic oracle play plus Loner, TYOV, Snallygaster, Muscadines, and Ironforge.
      </p>
    </div>
  );
}
