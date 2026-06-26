import { expect, test } from '@playwright/test';

function parseTableUrl(url: string) {
  const parsed = new URL(url);
  const roomId = parsed.pathname.split('/').pop() ?? '';
  const invite = parsed.searchParams.get('invite');
  return { roomId, invite, pathWithQuery: `${parsed.pathname}${parsed.search}` };
}

async function readStoredInvite(page: import('@playwright/test').Page, roomId: string) {
  return page.evaluate((id) => localStorage.getItem(`codex-table-invite-${id}`), roomId);
}

test.describe('multiplayer table', () => {
  test('host and guest see each other with invite token', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    try {
      await host.goto('/play?system=loner');
      await host.getByTestId('create-table-button').click();
      await expect(host).toHaveURL(/\/play\/[^/?]+(\?.*)?$/);
      await expect(host.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });

      const { roomId } = parseTableUrl(host.url());
      expect(roomId.length).toBeGreaterThanOrEqual(8);

      const invite = await readStoredInvite(host, roomId);
      expect(invite).toBeTruthy();
      expect(invite!.length).toBeGreaterThanOrEqual(16);

      await host.getByTestId('table-presence-name-input').fill('Host');
      await host.getByTestId('table-presence-name-input').blur();

      await guest.goto(`/play/${roomId}?system=loner&invite=${invite}`);
      await expect(guest.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });
      await guest.getByTestId('table-presence-name-input').fill('Guest');
      await guest.getByTestId('table-presence-name-input').blur();

      await expect(host.getByTestId('table-presence-peer')).toHaveCount(1, { timeout: 20_000 });
      await expect(guest.getByTestId('table-presence-peer')).toHaveCount(1, { timeout: 20_000 });
      await expect(host.getByTestId('table-presence-peer')).toContainText('Guest');
      await expect(guest.getByTestId('table-presence-peer')).toContainText('Host');

      await expect(host.getByTestId('table-gm-control')).toBeVisible();
      await expect(guest.getByTestId('table-gm-control')).toBeVisible();
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });

  test('rejects guest with wrong invite when PartyKit is live', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    try {
      await host.goto('/play?system=loner');
      await host.getByTestId('create-table-button').click();
      await expect(host.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });

      const { roomId } = parseTableUrl(host.url());
      const wrongInvite = '00000000000000000000000000000000';

      await guest.goto(`/play/${roomId}?system=loner&invite=${wrongInvite}`);
      await expect(guest.getByTestId('play-room-surface')).toBeVisible({ timeout: 15_000 });

      const guestStatus = guest.getByTestId('connection-status');
      await expect(guestStatus).toBeVisible();

      const partykitLive = (await host.getByTestId('connection-status').getAttribute(
        'data-connection-status',
      )) === 'connected';

      if (!partykitLive) {
        test.skip(true, 'PartyKit not running — skipping live auth assertion');
      }

      await expect
        .poll(async () => guestStatus.getAttribute('data-connection-status'), { timeout: 15_000 })
        .not.toBe('connected');

      await host.getByTestId('table-presence-name-input').fill('HostOnly');
      await host.getByTestId('table-presence-name-input').blur();
      await expect(host.getByTestId('table-presence-peer')).toHaveCount(0, { timeout: 10_000 });
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });
});
