import { expect, test } from '@playwright/test';

test.describe('core play loop smoke', () => {
  test('landing → roll → characters → loner table', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('landing-hero')).toBeVisible();

    await page.goto('/dice');
    await expect(page).toHaveTitle('Dice — Codex-W');
    await expect(page.getByRole('heading', { name: 'Dice', exact: true })).toBeVisible();

    const rollButton = page.getByTestId('dice-roll-button');
    await rollButton.click();
    await expect(page.getByTestId('dice-roll-result')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('dice-roll-total')).toContainText(/\d+/);

    await page.goto('/characters');
    await expect(page.getByTestId('characters-page')).toBeVisible();

    const characterLinks = page.getByTestId('character-sheet-link');
    if ((await characterLinks.count()) === 0) {
      await page.getByTestId('characters-new-generic').click();
      await expect(page).toHaveURL(/\/characters\/[^/]+$/);
      await page.goto('/characters');
      await expect(characterLinks.first()).toBeVisible();
    } else {
      await expect(characterLinks.first()).toBeVisible();
    }

    await page.goto('/play?system=loner');
    await expect(page.getByTestId('play-lobby')).toBeVisible();
    await expect(page.getByLabel('Game system')).toHaveValue('loner');
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+(\?.*)?$/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-system-panel')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Table info' }).click();
    await expect(page.getByTestId('table-presence')).toBeVisible();
    await expect(page.getByTestId('character-peek-button')).toBeVisible();
    await expect(page.getByText('Loner', { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('floating-dice-toggle')).toBeVisible();
    await page.getByTestId('floating-dice-toggle').click();
    await expect(page.getByTestId('floating-dice-roll')).toBeVisible();
  });

  test('TYOV table loads embedded journal panel', async ({ page }) => {
    await page.goto('/play?system=totv');
    await expect(page.getByTestId('play-lobby')).toBeVisible();
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+(\?.*)?$/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-totv-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-export-panel')).toBeVisible();
  });

  test('Snallygaster table loads camp panel', async ({ page }) => {
    await page.goto('/play?system=snallygaster');
    await page.getByTestId('create-table-button').click();
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-snallygaster-panel')).toBeVisible({ timeout: 15_000 });
  });

  test('Ironforge table loads vow panel with heat track', async ({ page }) => {
    await page.goto('/play?system=ironforge');
    await page.getByTestId('create-table-button').click();
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-ironforge-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('ironforge-heat-track')).toBeVisible();
  });

  test('Muscadines table loads grove panel', async ({ page }) => {
    await page.goto('/play?system=muscadines');
    await page.getByTestId('create-table-button').click();
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('table-muscadines-panel')).toBeVisible({ timeout: 15_000 });
  });

  test('play lobby paste invite link joins table', async ({ page }) => {
    await page.goto('/play?system=loner');
    await page.getByTestId('create-table-button').click();
    await expect(page).toHaveURL(/\/play\/([^/?]+)/);
    const inviteUrl = page.url();

    await page.goto('/play');
    await page.getByTestId('join-paste-link').fill(inviteUrl);
    await page.getByTestId('join-table-button').click();
    await expect(page).toHaveURL(/\/play\/[^/?]+/);
    await expect(page.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
  });

  test('library browser lists oracle tables', async ({ page }) => {
    await page.goto('/library');
    await expect(page.getByTestId('library-page')).toBeVisible();
    await expect(page.getByTestId('library-browser')).toBeVisible();
    await expect(page.getByText('All systems')).toBeVisible();
  });

  test('library search filters entries', async ({ page }) => {
    await page.goto('/library');
    await expect(page.getByTestId('library-browser')).toBeVisible();

    const search = page.getByLabel('Search library');
    await search.fill('Prompt journal');
    await expect(page.getByRole('heading', { name: 'Prompt journal' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oracle likelihoods' })).not.toBeVisible();

    await search.fill('zzznomatchzzz');
    await expect(page.getByText('No entries match your search.')).toBeVisible();
  });

  test('character portrait saves locally without cloud storage', async ({ page }) => {
    await page.goto('/characters');
    await expect(page.getByTestId('characters-page')).toBeVisible();

    const characterLinks = page.getByTestId('character-sheet-link');
    if ((await characterLinks.count()) === 0) {
      await page.getByTestId('characters-new-generic').click();
      await expect(page).toHaveURL(/\/characters\/[^/]+$/);
    } else {
      await characterLinks.first().click();
      await expect(page).toHaveURL(/\/characters\/[^/]+$/);
    }

    await expect(page.getByTestId('character-portrait-upload')).toBeVisible();
    await page.getByTestId('character-portrait-input').setInputFiles('e2e/fixtures/portrait.png');
    await expect(page.getByTestId('character-portrait-preview')).toBeVisible({ timeout: 10_000 });
  });
});
