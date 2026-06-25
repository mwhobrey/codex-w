import type { GameSystemId } from '@codex/schemas';
import { GameSystemIdSchema } from '@codex/schemas';
import type { SoloEngineKind } from '@codex/game-systems';

export function supportsTablePlayPanel(kind: SoloEngineKind | undefined): boolean {
  return (
    kind === 'oracle' ||
    kind === 'mentor' ||
    kind === 'prompt-journal' ||
    kind === 'lasers-feelings' ||
    kind === 'vow-progress'
  );
}

export function parseGameSystemId(value: string | null | undefined): GameSystemId | undefined {
  const parsed = GameSystemIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export type MapViewRole = 'gm' | 'player';

export function readMapViewRole(gameState: Record<string, unknown> | undefined): MapViewRole {
  return gameState?.mapRole === 'player' ? 'player' : 'gm';
}
