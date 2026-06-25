import type { PlaySessionLogEntryType } from '@codex/schemas';

export const LOG_TYPE_LABELS: Record<PlaySessionLogEntryType, string> = {
  roll: 'Roll',
  journal: 'Note',
  system: 'System',
  oracle: 'Oracle',
  twist: 'Twist',
  risk: 'Risk',
  scene: 'Scene',
  note: 'Note',
};

export const LOG_TYPE_STYLES: Record<PlaySessionLogEntryType, string> = {
  roll: 'bg-codex-ember/15 text-codex-ember',
  journal: 'bg-codex-elevated text-codex-text-muted',
  system: 'bg-codex-elevated text-codex-text-muted',
  oracle: 'bg-violet-500/15 text-violet-300',
  twist: 'bg-amber-500/15 text-amber-300',
  risk: 'bg-rose-500/15 text-rose-300',
  scene: 'bg-sky-500/15 text-sky-300',
  note: 'bg-codex-elevated text-codex-text-muted',
};

export type LogFilterKey = 'rolls' | 'oracles' | 'scenes' | 'notes';

export const LOG_FILTER_OPTIONS: { key: LogFilterKey; label: string }[] = [
  { key: 'rolls', label: 'Rolls' },
  { key: 'oracles', label: 'Oracles' },
  { key: 'scenes', label: 'Scenes' },
  { key: 'notes', label: 'Notes' },
];

export const LOG_FILTER_GROUPS: Record<LogFilterKey, PlaySessionLogEntryType[]> = {
  rolls: ['roll'],
  oracles: ['oracle', 'twist', 'risk'],
  scenes: ['scene'],
  notes: ['journal', 'note', 'system'],
};

export function matchesLogFilters(
  type: PlaySessionLogEntryType,
  activeFilters: ReadonlySet<LogFilterKey>,
): boolean {
  if (activeFilters.size === 0) return true;
  for (const key of activeFilters) {
    if (LOG_FILTER_GROUPS[key].includes(type)) return true;
  }
  return false;
}
