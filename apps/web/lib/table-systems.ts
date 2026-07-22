import type { GameSystemId } from '@codex/schemas';
import { GameSystemIdSchema } from '@codex/schemas';
export {
  supportsTablePlayPanel,
  resolveTablePanelId,
  type TablePanelId,
} from '@codex/game-systems';

export function parseGameSystemId(value: string | null | undefined): GameSystemId | undefined {
  if (!value) return undefined;
  const normalized = value === 'ironforge' ? 'ironsworn' : value;
  const parsed = GameSystemIdSchema.safeParse(normalized);
  return parsed.success ? parsed.data : undefined;
}

export type MapViewRole = 'gm' | 'player';
