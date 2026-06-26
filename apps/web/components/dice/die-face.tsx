import type { DieSides } from '@codex/game-engine';

interface DieFaceProps {
  value: number | null;
  sides: DieSides;
  rolling?: boolean;
  dropped?: boolean;
  /** Compact size for hero / inline previews */
  size?: 'sm' | 'md';
}

function formatSides(sides: DieSides): string {
  if (sides === 'percent') return 'd%';
  if (sides === 'fudge') return 'dF';
  return `d${sides}`;
}

function shapeClass(sides: DieSides): string {
  if (sides === 4) return 'die-shape-d4';
  if (sides === 6) return 'die-shape-d6';
  if (sides === 8) return 'die-shape-d8';
  if (sides === 10 || sides === 'percent') return 'die-shape-d10';
  if (sides === 12) return 'die-shape-d12';
  if (sides === 20) return 'die-shape-d20';
  if (sides === 'fudge') return 'die-shape-df';
  return 'die-shape-d6';
}

export function DieFace({
  value,
  sides,
  rolling = false,
  dropped = false,
  size = 'md',
}: DieFaceProps) {
  const label = value === null ? '?' : value;
  const dim = size === 'sm' ? 'h-14 w-14 text-lg' : 'h-16 w-16 text-xl';

  const sidesLabel = formatSides(sides);
  const valueLabel = value === null ? 'unknown' : String(value);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`die-face relative flex items-center justify-center font-mono font-semibold tabular-nums transition-all ${dim} ${shapeClass(sides)} ${
          rolling
            ? 'animate-dice-tumble border-codex-ember/60 bg-codex-elevated text-codex-ember'
            : dropped
              ? 'border-codex-border/40 bg-codex-surface/50 text-codex-text-faint line-through opacity-40'
              : 'border-codex-ember/40 bg-codex-elevated text-codex-ember shadow-lg shadow-primary/10'
        }`}
        aria-label={
          rolling ? `Rolling ${sidesLabel}` : `${sidesLabel} result ${valueLabel}${dropped ? ', dropped' : ''}`
        }
        aria-busy={rolling}
      >
        <span aria-hidden>{label}</span>
      </div>
      <span className="text-[10px] font-normal text-codex-text-faint" aria-hidden>
        {sidesLabel}
      </span>
    </div>
  );
}
