'use client';

import { getGameSystem } from '@codex/game-systems';
import { supportsTablePlayPanel } from '@/lib/table-systems';
import { TableIronforgePanel } from './table-ironforge-panel';
import type { TablePanelProps } from './table-panel-types';
import { TableSnallygasterPanel } from './table-snallygaster-panel';
import { TableSystemPanel } from './table-system-panel';
import { TableTotvPanel } from './table-totv-panel';

export function TablePlayPanel(props: TablePanelProps) {
  const engine = getGameSystem(props.gameSystemId).soloEngine;
  if (!engine || !supportsTablePlayPanel(engine.kind)) return null;

  switch (engine.kind) {
    case 'prompt-journal':
      return <TableTotvPanel {...props} />;
    case 'lasers-feelings':
      return <TableSnallygasterPanel {...props} />;
    case 'vow-progress':
      return <TableIronforgePanel {...props} />;
    case 'oracle':
    case 'mentor':
    default:
      return <TableSystemPanel {...props} />;
  }
}
