import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { fulfillGraphQL, getGraphQLOperation } from './fixtures/graphql-route';

// AC-016/UI-P7: analytics charts code-split on first visit only
// @category: fixture-e2e
// @lane: fixture-e2e

const platformAnalyticsMock = {
  platformAnalytics: {
    totalOrders: 120,
    totalRevenue: 45000,
    averageOrderValue: 375,
    totalStores: 8,
    pendingStores: 2,
    totalCustomers: 340,
  },
  platformSalesOverTime: [],
  platformSalesByPaymentMethod: [],
  platformSalesByCategory: [],
  platformTopProducts: [],
  platformTopStores: [],
};

function resolvePlatformAnalyticsOperation(
  operation: string | undefined,
  query: string,
): Record<string, unknown> | null {
  if (operation === 'PlatformAnalytics' || query.includes('platformAnalytics(')) {
    return { platformAnalytics: platformAnalyticsMock.platformAnalytics };
  }
  if (operation === 'PlatformSalesOverTime' || query.includes('platformSalesOverTime(')) {
    return { platformSalesOverTime: platformAnalyticsMock.platformSalesOverTime };
  }
  if (
    operation === 'PlatformSalesByPaymentMethod' ||
    query.includes('platformSalesByPaymentMethod(')
  ) {
    return { platformSalesByPaymentMethod: platformAnalyticsMock.platformSalesByPaymentMethod };
  }
  if (operation === 'PlatformSalesByCategory' || query.includes('platformSalesByCategory(')) {
    return { platformSalesByCategory: platformAnalyticsMock.platformSalesByCategory };
  }
  if (operation === 'PlatformTopProducts' || query.includes('platformTopProducts(')) {
    return { platformTopProducts: platformAnalyticsMock.platformTopProducts };
  }
  if (operation === 'PlatformTopStores' || query.includes('platformTopStores(')) {
    return { platformTopStores: platformAnalyticsMock.platformTopStores };
  }
  if (operation === 'AdminStores' || query.includes('adminStores')) {
    return { adminStores: [] };
  }

  return null;
}

test.describe('admin analytics code split', () => {
  test('requests analytics chunks only after visiting analytics', async ({ page }) => {
    const scriptRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (request.resourceType() === 'script' || url.includes('/_next/static/')) {
        scriptRequests.push(url);
      }
    });

    await page.route('**/graphql', async (route) => {
      const body = (route.request().postDataJSON() ?? {}) as {
        operationName?: string;
        query?: string;
      };
      const query = body.query ?? '';
      const operation = getGraphQLOperation(body);
      const data = resolvePlatformAnalyticsOperation(operation, query);

      await fulfillGraphQL(route, data ?? {});
    });

    await authenticateAsAdmin(page);
    await page.goto('/admin/stores');
    await expect(page.getByRole('heading', { name: 'จัดการร้านค้า' })).toBeVisible();
    const scriptsAfterStores = new Set(scriptRequests);

    await page.goto('/admin/analytics');
    await expect(page.getByRole('heading', { name: 'ภาพรวมแพลตฟอร์ม' })).toBeVisible();
    expect(scriptRequests.some((url) => !scriptsAfterStores.has(url))).toBe(true);

    await page.goto('/admin/stores');
    await page.goto('/admin/analytics');
    await expect(page.getByRole('heading', { name: 'ภาพรวมแพลตฟอร์ม' })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('กำลังโหลดข้อมูล...');
  });
});
