import type { GameSystemId } from '@codex/schemas';
import { genericPlugin } from './generic';
import { ironforgePlugin } from './ironforge';
import { lonerPlugin } from './loner';
import { muscadinesPlugin } from './muscadines';
import { snallygasterPlugin } from './snallygaster';
import { totvPlugin } from './totv';
import type { GameSystemPlugin } from './types';

const registry: Record<GameSystemId, GameSystemPlugin | undefined> = {
  generic: genericPlugin,
  loner: lonerPlugin,
  totv: totvPlugin,
  snallygaster: snallygasterPlugin,
  muscadines: muscadinesPlugin,
  ironforge: ironforgePlugin,
};

export function getGameSystem(id: GameSystemId): GameSystemPlugin {
  const plugin = registry[id];
  if (!plugin) {
    throw new Error(`Game system "${id}" is not implemented yet`);
  }
  return plugin;
}

export function listAvailableSystems(): GameSystemPlugin[] {
  return Object.values(registry).filter((plugin): plugin is GameSystemPlugin => plugin !== undefined);
}

export function listSoloSystems(): GameSystemPlugin[] {
  const systems = listAvailableSystems().filter((plugin) => plugin.soloEngine !== undefined);
  return systems.sort((a, b) => {
    if (a.id === 'generic') return -1;
    if (b.id === 'generic') return 1;
    return a.name.localeCompare(b.name);
  });
}
