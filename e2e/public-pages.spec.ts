import { test, expect } from '@playwright/test';
import { authenticateAsVendor } from './fixtures/taxonomy/admin-auth';

test.describe('Public pages', () => {
  test('register page renders vendor signup form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'ลงทะเบียนผู้ขาย' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('login page is reachable from register link', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('redirects authenticated vendor away from register', async ({ page }) => {
    await authenticateAsVendor(page);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/vendor$/);
  });
});
