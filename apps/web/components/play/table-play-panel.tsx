'use client';

import { resolveTablePanelId } from '@codex/game-systems';
import { getGameSystem } from '@codex/game-systems';
import type { TablePanelProps } from './table-panel-types';
import { TableIronforgePanel } from './table-ironforge-panel';
import { TableMuscadinesPanel } from './table-muscadines-panel';
import { TableSnallygasterPanel } from './table-snallygaster-panel';
import { TableSystemPanel } from './table-system-panel';
import { TableTotvPanel } from './table-totv-panel';

export function TablePlayPanel(props: TablePanelProps) {
  const engine = getGameSystem(props.gameSystemId).soloEngine;
  const panelId = resolveTablePanelId(engine?.kind);
  if (!panelId) return null;

  switch (panelId) {
    case 'totv':
      return <TableTotvPanel {...props} />;
    case 'snallygaster':
      return <TableSnallygasterPanel {...props} />;
    case 'ironforge':
      return <TableIronforgePanel {...props} />;
    case 'muscadines':
      return <TableMuscadinesPanel {...props} />;
    case 'system':
    default:
      return <TableSystemPanel {...props} />;
  }
}
