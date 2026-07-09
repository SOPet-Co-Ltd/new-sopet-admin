import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';

// AC-016/UI-P7: analytics charts code-split on first visit only
// @category: fixture-e2e
// @lane: fixture-e2e

test.describe('admin analytics code split', () => {
  test('requests analytics chunks only after visiting analytics', async ({ page }) => {
    const requestedChunks: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('sales-over-time-chart') || url.includes('breakdown-chart')) {
        requestedChunks.push(url);
      }
    });

    await authenticateAsAdmin(page);
    await page.goto('/admin/stores');
    await page.waitForLoadState('networkidle');
    expect(requestedChunks).toHaveLength(0);

    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'ภาพรวมแพลตฟอร์ม' })).toBeVisible();

    await page.goto('/admin/stores');
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('กำลังโหลดข้อมูล...');
  });
});
