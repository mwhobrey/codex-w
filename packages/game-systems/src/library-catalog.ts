import type { GameSystemId } from '@codex/schemas';
import { listSoloSystems } from './registry';
import type { OracleTableEntry, PromptEntry } from './types';

export type LibraryCategory =
  | 'oracle-likelihood'
  | 'twist'
  | 'scene-prompt'
  | 'prompt-journal'
  | 'mentor'
  | 'table'
  | 'forge';

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

    if (engine.twistTable?.length) {
      entries.push({
        id: `${plugin.id}-twist`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'twist',
        title: 'Twist table',
        rows: mapTableRows(engine.twistTable),
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
      entries.push({
        id: `${plugin.id}-camp-problems`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'table',
        title: 'Camp problems',
        rows: mapTableRows(engine.lasersFeelings.problemTable),
      });
      if (engine.lasersFeelings.activityTable?.length) {
        entries.push({
          id: `${plugin.id}-camp-activities`,
          systemId: plugin.id,
          systemName: plugin.name,
          category: 'table',
          title: 'Camp activities',
          rows: mapTableRows(engine.lasersFeelings.activityTable),
        });
      }
    }

    if (engine.vowProgress) {
      entries.push({
        id: `${plugin.id}-hazards`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'forge',
        title: 'Forge hazards',
        rows: mapTableRows(engine.vowProgress.hazardTable),
      });
      entries.push({
        id: `${plugin.id}-complications`,
        systemId: plugin.id,
        systemName: plugin.name,
        category: 'forge',
        title: 'Forge complications',
        rows: mapTableRows(engine.vowProgress.complicationTable),
      });
    }
  }

  return entries;
}
