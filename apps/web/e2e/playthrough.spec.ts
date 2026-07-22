import { expect, test } from '@playwright/test';
import type { GameSystemId } from '@codex/schemas';
import {
  PANEL_TEST_ID,
  bindCharacterByName,
  createNamedCharacter,
  expectLogContains,
  openSystemTable,
} from './helpers/playthrough';

/**
 * UI contract playthroughs: create a sheet, open a table, bind the character,
 * fire one core system action, assert visible outcome. No cloud/DB assertions.
 */
const SYSTEMS: {
  id: GameSystemId;
  label: string;
  play: (page: import('@playwright/test').Page, characterName: string) => Promise<void>;
}[] = [
  {
    id: 'generic',
    label: 'Generic',
    play: async (page) => {
      await expect(page.getByTestId('table-system-panel')).toBeVisible();
      // Generic panel is oracle/scene focused — append via floating dice as shared action.
      await page.getByTestId('floating-dice-toggle').click();
      await page.getByTestId('floating-dice-roll').click();
      await expectLogContains(page, /\d+/);
    },
  },
  {
    id: 'loner',
    label: 'Loner',
    play: async (page) => {
      await expect(page.getByTestId('table-loner-panel')).toBeVisible();
      await page.getByTestId('loner-oracle-question').fill('Is the alley empty?');
      await page.getByTestId('loner-ask-oracle').click();
      await expect(page.getByTestId('loner-oracle-reveal')).not.toHaveText(
        /Answer appears here/,
        { timeout: 10_000 },
      );
      await expectLogContains(page, /alley empty|Chance|Yes|No|Twist/i);
    },
  },
  {
    id: 'paranormal-files',
    label: 'Paranormal Files',
    play: async (page) => {
      await expect(page.getByTestId('table-loner-panel')).toBeVisible();
      await expect(page.getByText(/Unknown Threshold:\s*\d+/)).toBeVisible();
      await page.getByTestId('loner-oracle-question').fill('Is the anomaly hostile?');
      await page.getByTestId('loner-ask-oracle').click();
      await expect(page.getByTestId('loner-oracle-reveal')).not.toHaveText(
        /Answer appears here/,
        { timeout: 10_000 },
      );
      await expectLogContains(page, /anomaly hostile|Chance|Yes|No|Twist/i);
    },
  },
  {
    id: 'totv',
    label: 'Thousand Year Old Vampire',
    play: async (page) => {
      await expect(page.getByTestId('table-totv-panel')).toBeVisible();
      await page.getByTestId('totv-advance-prompt').click();
      await expect(page.getByTestId('totv-roll-reveal')).not.toHaveText(
        /Navigation roll appears here/,
        { timeout: 10_000 },
      );
      await expect(page.getByText(/Prompt \d+/)).toBeVisible();
    },
  },
  {
    id: 'snallygaster',
    label: 'Camp Snallygaster',
    play: async (page) => {
      await expect(page.getByTestId('table-snallygaster-panel')).toBeVisible();
      await expect(page.getByTestId('snally-number')).toBeVisible();
      await page.getByTestId('snally-roll').click();
      await expect(page.getByTestId('snally-roll-reveal')).not.toHaveText(
        /Roll results appear here/,
        { timeout: 10_000 },
      );
      await expectLogContains(page, /Counselor|Monster|success|FAIL|MIXED|CRITICAL/i);
    },
  },
  {
    id: 'muscadines',
    label: 'Midnight Muscadines',
    play: async (page) => {
      await expect(page.getByTestId('table-muscadines-panel')).toBeVisible();
      await page.getByTestId('muscadines-next-mentor').click();
      await expect(page.getByTestId('muscadines-reveal')).not.toHaveText(
        /Rolls and answers appear here/,
        { timeout: 10_000 },
      );
      await expectLogContains(page, /Mentor/i);
    },
  },
  {
    id: 'ironsworn',
    label: 'Ironsworn',
    play: async (page) => {
      await expect(page.getByTestId('table-ironsworn-panel')).toBeVisible();
      await expect(page.getByTestId('ironsworn-meters')).toBeVisible();
      await expect(page.getByTestId('ironsworn-vow-track')).toBeVisible();
      await page.getByPlaceholder('Vow name').fill('Find the iron');
      await page.getByTestId('ironsworn-create-vow').click();
      await expect(page.getByText(/Find the iron/)).toBeVisible();
      await page.getByTestId('ironsworn-roll-action').click();
      await expect(page.getByTestId('ironsworn-roll-reveal')).not.toHaveText(
        /Rolls and oracle results appear here/,
        { timeout: 10_000 },
      );
      await expectLogContains(page, /strong hit|weak hit|miss|action/i);
    },
  },
];

for (const system of SYSTEMS) {
  test.describe(`${system.label} playthrough`, () => {
    test(`create character, open table, short play action`, async ({ page }) => {
      const characterName = `E2E ${system.id} ${Date.now().toString(36)}`;

      await createNamedCharacter(page, system.id, characterName);
      await openSystemTable(page, system.id);
      await expect(page.getByTestId(PANEL_TEST_ID[system.id])).toBeVisible({ timeout: 15_000 });
      await bindCharacterByName(page, characterName);
      await system.play(page, characterName);
    });
  });
}
