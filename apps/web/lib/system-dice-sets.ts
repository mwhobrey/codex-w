import { listSoloSystems } from '@codex/game-systems';
import type { DiceFormula, DiceSet } from '@codex/schemas';

export interface SystemDiceSetTemplate {
  gameSystemId: string;
  name: string;
  formulas: DiceFormula[];
}

export function listSystemDiceSetTemplates(): SystemDiceSetTemplate[] {
  return listSoloSystems()
    .map((plugin) => ({
      gameSystemId: plugin.id,
      name: `${plugin.name} rolls`,
      formulas: (plugin.dicePresets ?? []).map((preset) => ({
        label: preset.label,
        notation: preset.notation,
      })),
    }))
    .filter((template) => template.formulas.length > 0);
}

export function createDiceSetFromTemplate(
  ownerId: string,
  template: SystemDiceSetTemplate,
): DiceSet {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ownerId,
    name: template.name,
    formulas: template.formulas.map((formula) => ({ ...formula })),
    createdAt: now,
    updatedAt: now,
  };
}
