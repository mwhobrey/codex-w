import type { GameSystemId } from '@codex/schemas';
import { genericPlugin } from './generic';
import { ironswornPlugin } from './ironsworn';
import { lonerPlugin } from './loner';
import { muscadinesPlugin } from './muscadines';
import { paranormalFilesPlugin } from './paranormal-files';
import { snallygasterPlugin } from './snallygaster';
import { totvPlugin } from './totv';
import type { GameSystemPlugin } from './types';

/** Legacy Ironforge tables/sheets resolve to Ironsworn. */
export function normalizeGameSystemId(id: string): GameSystemId {
  if (id === 'ironforge') return 'ironsworn';
  return id as GameSystemId;
}

const registry: Record<GameSystemId, GameSystemPlugin | undefined> = {
  generic: genericPlugin,
  loner: lonerPlugin,
  'paranormal-files': paranormalFilesPlugin,
  totv: totvPlugin,
  snallygaster: snallygasterPlugin,
  muscadines: muscadinesPlugin,
  ironsworn: ironswornPlugin,
};

export function getGameSystem(id: GameSystemId | string): GameSystemPlugin {
  const normalized = normalizeGameSystemId(id);
  const plugin = registry[normalized];
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
