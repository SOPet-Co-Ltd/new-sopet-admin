import { test, expect } from '@playwright/test';

test.describe('Unauthenticated access', () => {
  test('redirects / to login', async ({ page }) => {
    await page.goto('/');
    // `/` redirects client-side via useEffect; allow extra time under parallel workers.
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('redirects /vendor to login', async ({ page }) => {
    await page.goto('/vendor');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects /admin/stores to login', async ({ page }) => {
    await page.goto('/admin/stores');
    await expect(page).toHaveURL(/\/login$/);
  });
});
