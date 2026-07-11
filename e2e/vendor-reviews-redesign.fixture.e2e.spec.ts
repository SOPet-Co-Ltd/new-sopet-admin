import { test, expect } from '@playwright/test';
import { authenticateAsVendor } from './fixtures/taxonomy/admin-auth';

// AC-003, AC-007–AC-009: Vendor reviews redesign multi-step journey.
// @category: fixture-e2e
// @lane: fixture-e2e

test.describe('vendor reviews redesign fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/graphql', async (route) => {
      const body = route.request().postDataJSON() as { operationName?: string };
      const operation = body.operationName;

      if (operation === 'StoreReviewSummary') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              storeReviewSummary: {
                averageRating: 4.5,
                reviewCount: 1,
                ratingDistribution: [
                  { rating: 5, count: 1 },
                  { rating: 4, count: 0 },
                  { rating: 3, count: 0 },
                  { rating: 2, count: 0 },
                  { rating: 1, count: 0 },
                ],
                productBreakdown: [
                  {
                    productId: 'prod-1',
                    productName: 'Dog Food',
                    averageRating: 5,
                    reviewCount: 1,
                  },
                ],
              },
            },
          }),
        });
        return;
      }

      if (operation === 'StoreProductReviews') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              storeProductReviews: {
                items: [
                  {
                    id: 'review-1',
                    productId: 'prod-1',
                    productName: 'Dog Food',
                    productSlug: 'dog-food',
                    productImageUrl: null,
                    rating: 5,
                    comment: 'Great product',
                    status: 'approved',
                    reply: null,
                  },
                ],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
              },
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await authenticateAsVendor(page);
  });

  test('loads collapsed review cards with summary and reply filter', async ({ page }) => {
    await page.goto('/vendor/reviews');

    await expect(page.getByRole('heading', { name: 'รีวิว' })).toBeVisible();
    await expect(page.getByText('รีวิวตามสินค้า')).toBeVisible();
    await expect(page.getByText('Great product')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ตอบกลับ' })).toBeVisible();
    await expect(page.getByLabel('สถานะการตอบกลับ')).toBeVisible();
    await expect(page.locator('textarea')).toHaveCount(0);
  });
});
