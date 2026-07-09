import { test, expect } from '@playwright/test';
import {
  authenticateAsAdmin,
  authenticateAsVendor,
  createMalformedAccessToken,
} from './fixtures/taxonomy/admin-auth';

// AC-009/AC-010/AC-011: proxy.ts auth gate journey
// @category: fixture-e2e
// @lane: fixture-e2e

test.describe('proxy auth gate', () => {
  test('redirects unauthenticated admin and vendor routes to login', async ({ page }) => {
    await page.goto('/admin/stores');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();

    await page.goto('/vendor');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects vendor role away from admin routes', async ({ page }) => {
    await authenticateAsVendor(page);
    await page.goto('/admin/stores');
    await expect(page).toHaveURL(/\/vendor$/);
  });

  test('redirects admin role away from vendor routes', async ({ page }) => {
    await authenticateAsAdmin(page);
    await page.goto('/vendor');
    await expect(page).toHaveURL(/\/admin\/stores$/);
  });

  test('redirects malformed role tokens to login', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: createMalformedAccessToken(),
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/admin/stores');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('does not flash loading text during protected-to-protected navigation', async ({ page }) => {
    await authenticateAsAdmin(page);
    await page.goto('/admin/stores');

    const loadingSnapshots: string[] = [];
    page.on('framenavigated', async () => {
      const text = await page
        .locator('body')
        .innerText()
        .catch(() => '');
      loadingSnapshots.push(text);
    });

    const storesLink = page.getByRole('link', { name: /stores|ร้านค้า/i }).first();
    if (await storesLink.isVisible()) {
      await storesLink.click();
    } else {
      await page.goto('/admin/taxonomy');
    }

    await page.waitForLoadState('networkidle');
    expect(loadingSnapshots.join('\n')).not.toContain('กำลังโหลด...');
    await expect(page.locator('body')).not.toContainText('กำลังโหลด...');
  });
});
