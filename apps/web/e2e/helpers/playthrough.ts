import { expect, type Page } from '@playwright/test';
import type { GameSystemId } from '@codex/schemas';

export async function createNamedCharacter(
  page: Page,
  systemId: GameSystemId | 'generic',
  name: string,
): Promise<void> {
  await page.goto('/characters');
  await expect(page.getByTestId('characters-page')).toBeVisible();

  const createTestId =
    systemId === 'generic' ? 'characters-new-generic' : `characters-new-${systemId}`;
  await page.getByTestId(createTestId).click();
  await expect(page).toHaveURL(/\/characters\/[^/]+$/);

  const nameInput = page.getByTestId('character-name-input');
  await expect(nameInput).toBeVisible();
  await nameInput.fill(name);
  await expect(nameInput).toHaveValue(name);

  // Wait for local autosave debounce to settle.
  await page.waitForTimeout(400);
}

export async function openSystemTable(page: Page, systemId: GameSystemId): Promise<void> {
  await page.goto(`/play?system=${systemId}`);
  await expect(page.getByTestId('play-lobby')).toBeVisible();
  await expect(page.getByLabel('Game system')).toHaveValue(systemId);
  await page.getByTestId('create-table-button').click();
  await expect(page).toHaveURL(/\/play\/[^/?]+/);
  await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
}

export async function bindCharacterByName(page: Page, name: string): Promise<void> {
  const picker = page.getByTestId('character-picker-select');
  await expect(picker).toBeVisible({ timeout: 15_000 });
  await picker.selectOption({ label: name });
  await expect(picker).not.toHaveValue('');
}

export async function openSessionLog(page: Page): Promise<void> {
  await page.getByRole('tab', { name: 'Session' }).click();
  await expect(page.getByTestId('session-log')).toBeVisible();
}

export async function expectLogContains(page: Page, pattern: RegExp | string): Promise<void> {
  await openSessionLog(page);
  const entry = page.getByTestId('session-log-entry').filter({ hasText: pattern }).first();
  await expect(entry).toBeVisible({ timeout: 15_000 });
}

export const PANEL_TEST_ID: Record<GameSystemId, string> = {
  generic: 'table-system-panel',
  loner: 'table-loner-panel',
  'paranormal-files': 'table-loner-panel',
  totv: 'table-totv-panel',
  snallygaster: 'table-snallygaster-panel',
  muscadines: 'table-muscadines-panel',
  ironsworn: 'table-ironsworn-panel',
};
