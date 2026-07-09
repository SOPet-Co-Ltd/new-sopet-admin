import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';

// AC-015: DashboardShell nav hover-prefetch
// @category: fixture-e2e
// @lane: fixture-e2e

test.describe('admin nav prefetch', () => {
  test('hovering stores nav link does not change link appearance', async ({ page }) => {
    let storesQueryCount = 0;

    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON() as { query?: string };
      if (body.query?.includes('adminStores')) {
        storesQueryCount += 1;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            adminStores: [],
          },
        }),
      });
    });

    await authenticateAsAdmin(page);
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    const storesLink = page.getByRole('link', { name: 'ร้านค้า' });
    const classNameBefore = await storesLink.evaluate((node) => node.className);

    await storesLink.hover();
    await page.waitForTimeout(300);

    const classNameAfter = await storesLink.evaluate((node) => node.className);
    expect(classNameAfter).toBe(classNameBefore);
    expect(storesQueryCount).toBeGreaterThanOrEqual(1);

    storesQueryCount = 0;
    await storesLink.click();
    await page.waitForURL(/\/admin\/stores$/);
    await expect(page.getByRole('heading', { name: 'จัดการร้านค้า' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('กำลังโหลด...');
    expect(storesQueryCount).toBe(0);
  });
});
