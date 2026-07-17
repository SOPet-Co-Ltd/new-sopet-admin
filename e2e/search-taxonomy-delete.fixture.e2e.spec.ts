import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { installTaxonomyGraphQLMocks } from './fixtures/taxonomy/graphql-mock';

function cardByHeading(page: Page, name: string | RegExp) {
  return page.locator('div.rounded-xl').filter({ has: page.getByRole('heading', { name }) });
}

test.describe('Search taxonomy fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
    await installTaxonomyGraphQLMocks(page);
  });

  test('Journey AC2: rejected categories and tags with delete-only actions', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    await expect(page.getByRole('heading', { name: 'หมวดหมู่ที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('หมวดที่ปฏิเสธ')).toBeVisible();
    await expect(page.getByText('ปฏิเสธแล้ว').first()).toBeVisible();

    const categoryRejectedSection = cardByHeading(page, 'หมวดหมู่ที่ปฏิเสธแล้ว');
    await expect(categoryRejectedSection.getByRole('button', { name: 'ลบ' })).toBeVisible();
    await expect(categoryRejectedSection.getByRole('button', { name: 'อนุมัติ' })).toHaveCount(0);
    await expect(categoryRejectedSection.getByRole('button', { name: 'ปฏิเสธ' })).toHaveCount(0);

    await page.getByRole('tab', { name: /แท็ก/ }).click();
    await expect(page.getByRole('heading', { name: 'แท็กที่ปฏิเสธแล้ว' })).toBeVisible();
    await expect(page.getByText('แท็กที่ปฏิเสธ', { exact: true })).toBeVisible();
  });

  test('Journey AC1: category delete wizard with replacement', async ({ page }) => {
    await page.goto('/admin/taxonomy');

    const deleteButton = cardByHeading(page, 'หมวดหมู่ที่อนุมัติแล้ว')
      .getByRole('button', { name: 'ลบ' })
      .first();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('หมวดหมู่นี้มีสินค้า 3 รายการ')).toBeVisible();
    await expect(dialog.getByText('สินค้า A')).toBeVisible();

    await dialog.getByRole('button', { name: 'ถัดไป' }).click();
    const replacementNext = dialog.getByRole('button', { name: 'ถัดไป' });
    await expect(replacementNext).toBeDisabled();

    await dialog.getByLabel('หมวดหมู่ทดแทน').selectOption({ index: 1 });
    await expect(replacementNext).toBeEnabled();
    await replacementNext.click();

    await dialog.getByRole('button', { name: 'ลบหมวดหมู่' }).click();
    await expect(dialog).toBeHidden();
  });

  test('Journey AC3: requests taxonomy approve blocked without image', async ({ page }) => {
    await page.goto('/admin/requests?tab=taxonomy');

    const approveButton = page.getByRole('button', { name: 'อนุมัติ' }).first();
    await expect(approveButton).toBeDisabled();
    await expect(page.getByText('ต้องอัปโหลดรูปภาพก่อนอนุมัติ').first()).toBeVisible();
  });
});
