import type { SceneBounds } from '@/lib/map-bounds';

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  stamps: { symbolId: string; bounds: SceneBounds }[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'forest-clearing',
    name: 'Forest clearing',
    description: 'Woods with a grassy open center.',
    stamps: [
      { symbolId: 'forest', bounds: { x: -200, y: -160, width: 400, height: 320 } },
      { symbolId: 'grass', bounds: { x: -80, y: -60, width: 160, height: 120 } },
      { symbolId: 'rock', bounds: { x: 40, y: 20, width: 48, height: 40 } },
    ],
  },
  {
    id: 'riverside-camp',
    name: 'Riverside camp',
    description: 'Water, sand, and a travel camp.',
    stamps: [
      { symbolId: 'water', bounds: { x: -220, y: -40, width: 200, height: 120 } },
      { symbolId: 'sand', bounds: { x: 20, y: -20, width: 180, height: 100 } },
      { symbolId: 'camp', bounds: { x: 60, y: 10, width: 72, height: 56 } },
      { symbolId: 'grass', bounds: { x: -60, y: 40, width: 140, height: 80 } },
    ],
  },
  {
    id: 'ruined-hamlet',
    name: 'Ruined hamlet',
    description: 'Collapsed walls, tower, and bridge.',
    stamps: [
      { symbolId: 'ruins', bounds: { x: -120, y: -40, width: 100, height: 80 } },
      { symbolId: 'tower', bounds: { x: 40, y: -80, width: 64, height: 120 } },
      { symbolId: 'bridge', bounds: { x: -40, y: 60, width: 160, height: 32 } },
      { symbolId: 'grass', bounds: { x: -160, y: -100, width: 320, height: 220 } },
    ],
  },
];

export function getMapTemplate(id: string): MapTemplate | undefined {
  return MAP_TEMPLATES.find((template) => template.id === id);
}
