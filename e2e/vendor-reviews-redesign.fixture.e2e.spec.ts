import { test, expect } from '@playwright/test';
import { authenticateAsVendor } from './fixtures/taxonomy/admin-auth';
import { fulfillGraphQL, getGraphQLOperation } from './fixtures/graphql-route';

const VENDOR_STORE_ID = 'store-e2e-1';

// AC-003, AC-007–AC-009: Vendor reviews redesign multi-step journey.
// @category: fixture-e2e
// @lane: fixture-e2e

function resolveVendorReviewsOperation(
  operation: string | undefined,
  query: string,
): Record<string, unknown> | null {
  if (operation === 'StoreReviewSummary' || query.includes('storeReviewSummary')) {
    return {
      storeReviewSummary: {
        averageRating: 4.5,
        totalCount: 1,
        rating5Count: 1,
        rating4Count: 0,
        rating3Count: 0,
        rating2Count: 0,
        rating1Count: 0,
        productBreakdown: [
          {
            productId: 'prod-1',
            productName: 'Dog Food',
            averageRating: 5,
            reviewCount: 1,
          },
        ],
      },
    };
  }

  if (operation === 'StoreProductReviews' || query.includes('storeProductReviews')) {
    return {
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
            createdAt: '2026-01-01T00:00:00.000Z',
            customerName: 'E2E Customer',
            reply: null,
            images: [],
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };
  }

  if (operation === 'MyStores' || query.includes('myStores')) {
    return {
      myStores: [
        {
          membershipRole: 'owner',
          store: {
            id: VENDOR_STORE_ID,
            name: 'E2E Store',
            slug: 'e2e-store',
            description: null,
            logoUrl: null,
            bannerUrl: null,
            status: 'approved',
          },
        },
      ],
    };
  }

  return null;
}

test.describe('vendor reviews redesign fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/graphql', async (route) => {
      const body = (route.request().postDataJSON() ?? {}) as {
        operationName?: string;
        query?: string;
      };
      const query = body.query ?? '';
      const operation = getGraphQLOperation(body);
      const data = resolveVendorReviewsOperation(operation, query);

      await fulfillGraphQL(route, data ?? {});
    });

    await authenticateAsVendor(page);

    await page.addInitScript((storeId) => {
      window.localStorage.setItem(
        'sopet-vendor-store',
        JSON.stringify({
          state: { activeStoreId: storeId },
          version: 0,
        }),
      );
    }, VENDOR_STORE_ID);
  });

  test('loads collapsed review cards with summary and reply filter', async ({ page }) => {
    await page.goto('/vendor/reviews');

    await expect(page.getByRole('heading', { name: 'รีวิว', exact: true })).toBeVisible();
    await expect(page.getByText('รีวิวตามสินค้า')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'รีวิวล่าสุด' })).toBeVisible();
    await expect(page.getByText('Great product')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ตอบกลับ' })).toBeVisible();
    await expect(page.getByLabel('สถานะการตอบกลับ')).toBeVisible();
    await expect(page.locator('textarea')).toHaveCount(0);
  });
});
