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

  test.fixme('Journey AC1: multi-step category delete with reassignment', async () => {
    // Implemented in Phase 6 fixture-e2e task
  });

  test.fixme('Journey AC2: pending category upload enables approve', async () => {
    // Implemented in Phase 7 fixture-e2e task
  });

  test.fixme('Journey AC3: rejected categories and tags with delete-only actions', async () => {
    // Implemented in Phase 4 fixture-e2e task
  });
});
