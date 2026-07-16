import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import {
  expectedCreatePromotionConditions,
  LIST_CHIP_FIXTURE_LABELS,
  NEW_CUSTOMER_SEED_N_DAYS,
  platformPublishedProduct,
  PROMOTION_UC_PLATFORM_PRODUCT_ID,
} from './fixtures/promotion-universal-conditions/data';
import {
  installPromotionUniversalConditionsGraphQLMocks,
  type CreatePromotionCapture,
} from './fixtures/promotion-universal-conditions/graphql-mock';

/**
 * Promotion Universal Conditions — Admin create journey (fixture-e2e).
 * Promoted from e2e/promotion-universal-conditions.fixture.e2e.skeleton.ts
 *
 * Journey AC: Operator create with new-customer + BxGy product validation
 * (AC-001, AC-017, AC-023, AC-030–032, AC-034, UI-D-001)
 */

async function fillRequiredBasics(page: Page, code: string, name: string) {
  await page.getByLabel('รหัสโปรโมชัน').fill(code);
  await page.getByLabel('ชื่อโปรโมชัน').fill(name);
}

test.describe('Promotion universal conditions admin create fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
  });

  test('Journey: new-customer seeds N=30, BxGy requires product, save persists conditions + list chips', async ({
    page,
  }) => {
    // Ref object (not a bare `let`) — TS cannot narrow a `let` reassigned only inside a
    // closure, which otherwise resolves later reads to `never`.
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });

    await page.goto('/admin/promotions/new/buy_x_get_y');

    await expect(page.getByRole('heading', { name: 'ลูกค้าใหม่' })).toBeVisible();

    const newCustomerToggle = page.getByLabel(/ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว/);
    await newCustomerToggle.check();

    const nDaysInput = page.getByLabel('อายุบัญชีสูงสุด (วัน)');
    await expect(nDaysInput).toHaveValue(String(NEW_CUSTOMER_SEED_N_DAYS));

    await fillRequiredBasics(page, 'BUY2GET1', 'ซื้อ 2 แถม 1');

    // Submit without product → client Zod FieldError
    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: /กรุณาเลือกสินค้าสำหรับโปรซื้อแถม/ }),
    ).toBeVisible();
    expect(lastCapture.value).toBeNull();

    // Pick published platform product (storeId not required on mock)
    const productSearch = page.getByRole('combobox', { name: /สินค้าที่ใช้โปรโมชัน/ });
    await productSearch.focus();
    await expect(page.getByRole('option', { name: platformPublishedProduct.name })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('option', { name: platformPublishedProduct.name }).click();

    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();

    await expect.poll(() => lastCapture.value).not.toBeNull();
    expect(lastCapture.value?.conditionsParsed).toMatchObject({
      newCustomer: { enabled: true, nDays: NEW_CUSTOMER_SEED_N_DAYS },
      productId: PROMOTION_UC_PLATFORM_PRODUCT_ID,
      buyQuantity: expectedCreatePromotionConditions.buyQuantity,
      getQuantity: expectedCreatePromotionConditions.getQuantity,
    });

    // Successful create navigates to list; assert chips from mocked list payload
    await expect(page).toHaveURL(/\/admin\/promotions$/);
    await expect(page.getByText(LIST_CHIP_FIXTURE_LABELS.newCustomer)).toBeVisible();
    await expect(
      page.getByText(
        LIST_CHIP_FIXTURE_LABELS.bxgy(
          expectedCreatePromotionConditions.buyQuantity!,
          expectedCreatePromotionConditions.getQuantity!,
          PROMOTION_UC_PLATFORM_PRODUCT_ID,
        ),
      ),
    ).toBeVisible();
  });

  test('fixed_amount create shows order/store-subtotal baht-off label (not per-product)', async ({
    page,
  }) => {
    await installPromotionUniversalConditionsGraphQLMocks(page);
    await page.goto('/admin/promotions/new/fixed_amount');

    await expect(page.getByRole('heading', { name: 'ลูกค้าใหม่' })).toBeVisible();
    await expect(page.getByText(/ส่วนลดทั้งออเดอร์|ส่วนลดยอด/)).toBeVisible();
    await expect(page.getByText(/ต่อชิ้นสินค้า|per-product/i)).toHaveCount(0);
  });
});
