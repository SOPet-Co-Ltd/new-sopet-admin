import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { installTaxonomyGraphQLMocks } from './fixtures/taxonomy/graphql-mock';

test.describe('Category taxonomy fixture-e2e harness', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
    await installTaxonomyGraphQLMocks(page);
  });

  test('loads /admin/taxonomy with mocked GraphQL data', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    await expect(page.getByRole('heading', { name: 'หมวดหมู่และแท็ก' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'สร้างหมวดหมู่' })).toBeVisible();
    await expect(page.getByText('อาหารสัตว์')).toBeVisible();
    await expect(page.getByText('ของเล่นสัตว์')).toBeVisible();
    await expect(page.getByRole('button', { name: /หมวดหมู่ \(\d+\)/ })).toBeVisible();
  });

  test('shows rejected categories and tags with delete-only actions', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    await expect(page.getByRole('heading', { name: 'หมวดหมู่ที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('หมวดที่ปฏิเสธ')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ลบ' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'อนุมัติ' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ปฏิเสธ' })).toHaveCount(0);

    await page.getByRole('button', { name: /แท็ก \(\d+\)/ }).click();
    await expect(page.getByRole('heading', { name: 'แท็กที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('แท็กที่ปฏิเสธ')).toBeVisible();
  });

  test.fixme('Journey AC1: multi-step category delete with reassignment', async () => {
    // Requires extended GraphQL mock state for wizard transitions
  });

  test.fixme('Journey AC2: pending category upload enables approve', async () => {
    // Requires upload fixture wiring in Playwright harness
  });
});
