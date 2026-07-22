import type { GameSystemId } from '@codex/schemas';
import {
  flattenD66,
  pfConceptGrid,
  pfFrailtyGrid,
  pfGearGrid,
  pfSkillGrid,
} from './paranormal-files/tables';
import { listSoloSystems } from './registry';
import type { OracleTableEntry, PromptEntry } from './types';

export type LibraryCategory =
  | 'oracle-likelihood'
  | 'twist'
  | 'scene-prompt'
  | 'prompt-journal'
  | 'mentor'
  | 'table'
  | 'forge'
  | 'ironsworn'
  | 'chargen';

export interface LibraryEntry {
  id: string;
  systemId: GameSystemId;
  systemName: string;
  category: LibraryCategory;
  title: string;
  description?: string;
  rows: { roll?: number; label?: string; text: string }[];
}

function mapTableRows(table: OracleTableEntry[]) {
  return table.map((row) => ({ roll: row.roll, text: row.text }));
}

function mapPromptRows(prompts: PromptEntry[]) {
  return prompts.map((prompt) => ({
    roll: prompt.id,
    label: prompt.tags?.join(', '),
    text: prompt.text,
  }));
}

export function listLibraryEntries(): LibraryEntry[] {
  const entries: LibraryEntry[] = [];

  for (const plugin of listSoloSystems()) {
    const engine = plugin.soloEngine;
    if (!engine) continue;

    if (engine.oracleLikelihoods?.length) {
      entries.push({
        id: `${plugin.id}-oracle-likelihoods`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'oracle-likelihood',
        title: 'Oracle likelihoods',
        rows: engine.oracleLikelihoods.map((row) => ({
          label: row.label,
          text: `${row.description} (threshold ${row.threshold})`,
        })),
      });
    }

    if (engine.twistSubjects?.length && engine.twistActions?.length) {
      entries.push({
        id: `${plugin.id}-twist-subjects`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'twist',
        title: 'Twist subjects',
        rows: mapTableRows(engine.twistSubjects),
      });
      entries.push({
        id: `${plugin.id}-twist-actions`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'twist',
        title: 'Twist actions',
        rows: mapTableRows(engine.twistActions),
      });
    } else if (engine.twistTable?.length) {
      entries.push({
        id: `${plugin.id}-twist`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'twist',
        title: 'Twist table',
        rows: mapTableRows(engine.twistTable),
      });
    }

    if (engine.sceneMoodTable?.length) {
      entries.push({
        id: `${plugin.id}-scene-mood`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Next scene mood',
        rows: mapTableRows(engine.sceneMoodTable),
      });
    }

    if (engine.scenePrompts?.length) {
      entries.push({
        id: `${plugin.id}-scene-prompts`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'scene-prompt',
        title: 'Scene prompts',
        rows: engine.scenePrompts.map((text, index) => ({ roll: index + 1, text })),
      });
    }

    if (engine.prompts?.length) {
      entries.push({
        id: `${plugin.id}-journal`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'prompt-journal',
        title: 'Prompt journal',
        rows: mapPromptRows(engine.prompts),
      });
    }

    if (engine.mentorPrompts?.length) {
      entries.push({
        id: `${plugin.id}-mentor`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'mentor',
        title: 'Mentor prompts',
        rows: engine.mentorPrompts.map((row) => ({ label: row.label, text: row.text })),
      });
    }

    if (engine.folkloreTables?.groveOmens?.length) {
      entries.push({
        id: `${plugin.id}-grove-omens`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Grove omens',
        rows: mapTableRows(engine.folkloreTables.groveOmens),
      });
    }

    if (engine.folkloreTables?.jarResults?.length) {
      entries.push({
        id: `${plugin.id}-jar-results`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Jar results',
        rows: mapTableRows(engine.folkloreTables.jarResults),
      });
    }

    if (engine.lasersFeelings) {
      const lf = engine.lasersFeelings;
      const campTables: { suffix: string; title: string; rows: typeof lf.problemTable }[] = [
        { suffix: 'camp-problems', title: 'Mundane problems', rows: lf.mischiefTable ?? lf.problemTable },
      ];
      if (lf.activityTable?.length) {
        campTables.push({
          suffix: 'camp-activities',
          title: 'Daily activities',
          rows: lf.activityTable,
        });
      }
      if (lf.mischiefTable?.length && lf.problemTable !== lf.mischiefTable) {
        campTables.push({
          suffix: 'camper-mischief',
          title: 'Camper mischief',
          rows: lf.mischiefTable,
        });
      }
      if (lf.monstrousTable?.length) {
        campTables.push({
          suffix: 'monstrous-problems',
          title: 'Monstrous problems',
          rows: lf.monstrousTable,
        });
      }
      if (lf.locationTable?.length) {
        campTables.push({
          suffix: 'camp-locations',
          title: 'Camp locations',
          rows: lf.locationTable,
        });
      }
      if (lf.monsterTable?.length) {
        campTables.push({
          suffix: 'camp-monsters',
          title: 'Monsters',
          rows: lf.monsterTable,
        });
      }
      if (lf.campLeaderTable?.length) {
        campTables.push({
          suffix: 'camp-leader',
          title: 'Camp leader plot',
          rows: lf.campLeaderTable,
        });
      }
      if (lf.monsterMotiveTable?.length) {
        campTables.push({
          suffix: 'monster-motive',
          title: 'Monster motive (That is…)',
          rows: lf.monsterMotiveTable,
        });
      }
      if (lf.decisionOracleTable?.length) {
        campTables.push({
          suffix: 'decision-oracle',
          title: 'Decision oracle',
          rows: lf.decisionOracleTable,
        });
      }
      for (const table of campTables) {
        entries.push({
          id: `${plugin.id}-${table.suffix}`,
          systemId: plugin.id,
          systemName: plugin.name,
          category: 'table',
          title: table.title,
          rows: mapTableRows(table.rows),
        });
      }
    }

    if (engine.ironsworn) {
      for (const oracle of engine.ironsworn.oracles) {
        entries.push({
          id: `${plugin.id}-oracle-${oracle.id}`,
          systemId: plugin.id,
          systemName: plugin.name,
          category: 'ironsworn',
          title: oracle.title,
          rows: oracle.rows.map((row) => {
            if ('roll' in row && typeof row.roll === 'number') {
              return { roll: row.roll, text: String(row.text ?? '') };
            }
            if ('min' in row && 'max' in row) {
              return {
                roll: typeof row.max === 'number' ? row.max : undefined,
                label: `${row.min}–${row.max}`,
                text: String(row.text ?? ''),
              };
            }
            return { text: String(row.text ?? '') };
          }),
        });
      }
      entries.push({
        id: `${plugin.id}-moves`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'ironsworn',
        title: 'Core moves',
        rows: engine.ironsworn.moves.map((move) => ({
          label: move.name,
          text: move.trigger,
        })),
      });
      entries.push({
        id: `${plugin.id}-assets`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'ironsworn',
        title: 'Assets',
        rows: engine.ironsworn.assets.map((asset) => ({
          label: asset.name,
          text: asset.summary,
        })),
      });
    }

    if (engine.paranormalFiles) {
      entries.push({
        id: `${plugin.id}-reality-fracture`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Reality Fracture',
        rows: mapTableRows(engine.paranormalFiles.realityFractureTable),
      });
      entries.push({
        id: `${plugin.id}-threshold-deltas`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Unknown Threshold changes',
        rows: engine.paranormalFiles.thresholdDeltas.map((row) => ({
          label: row.label,
          text: `${row.description} (${row.delta >= 0 ? '+' : ''}${row.delta})`,
        })),
      });
      entries.push({
        id: `${plugin.id}-concepts`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'chargen',
        title: 'Concepts (d66)',
        rows: flattenD66(pfConceptGrid),
      });
      entries.push({
        id: `${plugin.id}-skills`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'chargen',
        title: 'Skills (d66)',
        rows: flattenD66(pfSkillGrid),
      });
      entries.push({
        id: `${plugin.id}-frailties`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'chargen',
        title: 'Frailties (d66)',
        rows: flattenD66(pfFrailtyGrid),
      });
      entries.push({
        id: `${plugin.id}-gear`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'chargen',
        title: 'Gear (d66)',
        rows: flattenD66(pfGearGrid),
      });
    }
  }

  return entries;
}
