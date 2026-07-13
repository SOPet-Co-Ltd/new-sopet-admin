import { test, expect } from '@playwright/test';
import {
  authenticateAsAdmin,
  authenticateAsVendor,
  createMalformedAccessToken,
} from './fixtures/taxonomy/admin-auth';
import { installTaxonomyGraphQLMocks } from './fixtures/taxonomy/graphql-mock';

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

  test('redirects authenticated vendor away from register via proxy', async ({ page }) => {
    await authenticateAsVendor(page);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/vendor$/);
  });

  test('does not flash loading text during protected-to-protected navigation', async ({ page }) => {
    await authenticateAsAdmin(page);
    await installTaxonomyGraphQLMocks(page);
    await page.goto('/admin/stores');
    await expect(page.getByRole('heading', { name: 'จัดการร้านค้า' })).toBeVisible();

    await page.getByRole('link', { name: 'หมวดหมู่และแท็ก' }).click();
    await page.waitForURL(/\/admin\/taxonomy$/);
    await expect(
      page.getByRole('heading', { name: 'หมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง และแบรนด์' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'สร้างหมวดหมู่' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('กำลังโหลด...');
  });
});
