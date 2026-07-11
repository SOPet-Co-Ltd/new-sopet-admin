import { test, expect } from '@playwright/test';
import { authenticateAsAdmin, authenticateAsVendor } from './fixtures/taxonomy/admin-auth';

// AC-011–AC-012: Admin search synonyms access guard (deferred full journey).
// @category: fixture-e2e
// @lane: fixture-e2e

test.describe('smart search admin fixture-e2e', () => {
  test('allows admin to open search synonyms page', async ({ page }) => {
    await authenticateAsAdmin(page);
    await page.goto('/admin/search/synonyms');
    await expect(page.getByRole('heading', { name: 'คำพ้องความหมายการค้นหา' })).toBeVisible();
  });

  test('redirects vendor away from admin search routes', async ({ page }) => {
    await authenticateAsVendor(page);
    await page.goto('/admin/search/synonyms');
    await expect(page).toHaveURL(/\/vendor$/);
  });
});
