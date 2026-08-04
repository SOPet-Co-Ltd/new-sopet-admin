import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { installTaxonomyGraphQLMocks } from './fixtures/taxonomy/graphql-mock';

function cardByHeading(page: Page, name: string | RegExp) {
  return page.locator('div.rounded-xl').filter({ has: page.getByRole('heading', { name }) });
}

test.describe('Category taxonomy fixture-e2e harness', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
    await installTaxonomyGraphQLMocks(page);
  });

  test('loads /admin/taxonomy with mocked GraphQL data', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    await expect(page.getByRole('heading', { name: 'จัดการหมวดหมู่และแท็กสินค้า' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'สร้างหมวดหมู่' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /หมวดหมู่/ })).toBeVisible();

    const approvedSection = cardByHeading(page, 'หมวดหมู่ที่อนุมัติแล้ว');
    await expect(approvedSection.getByText('อาหารสัตว์')).toBeVisible();
    await expect(approvedSection.getByText('ของเล่นสัตว์')).toBeVisible();

    const pendingSection = cardByHeading(page, 'หมวดหมู่รออนุมัติ');
    await expect(pendingSection.getByText('ของเล่นสัตว์')).toBeVisible();
  });

  test('shows rejected categories and tags with delete-only actions', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    await expect(page.getByRole('heading', { name: 'หมวดหมู่ที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('หมวดที่ปฏิเสธ', { exact: true })).toBeVisible();

    const categoryRejectedSection = cardByHeading(page, 'หมวดหมู่ที่ปฏิเสธแล้ว');
    await expect(categoryRejectedSection.getByRole('button', { name: 'ลบ' })).toBeVisible();
    await expect(categoryRejectedSection.getByRole('button', { name: 'อนุมัติ' })).toHaveCount(0);
    await expect(categoryRejectedSection.getByRole('button', { name: 'ปฏิเสธ' })).toHaveCount(0);

    await page.getByRole('tab', { name: /แท็ก/ }).click();
    await expect(page.getByRole('heading', { name: 'แท็กที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('แท็กที่ปฏิเสธ', { exact: true })).toBeVisible();
  });

  test.fixme('Journey AC1: multi-step category delete with reassignment', async () => {
    // Requires extended GraphQL mock state for wizard transitions
  });

  test.fixme('Journey AC2: pending category upload enables approve', async () => {
    // Requires upload fixture wiring in Playwright harness
  });
});
