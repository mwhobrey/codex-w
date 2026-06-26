import type { RollResult } from '@codex/game-engine';

interface RollLogProps {
  entries: RollResult[];
}

export function RollLog({ entries }: RollLogProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-8" aria-label="Roll history">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Recent rolls
      </h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.rolledAt}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-2 text-sm"
          >
            <span className="font-mono text-muted-foreground">{entry.notation}</span>
            <span className="font-mono font-semibold tabular-nums text-primary">
              {entry.total}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
