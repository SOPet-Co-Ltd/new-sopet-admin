import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { fulfillGraphQL, getGraphQLOperation } from './fixtures/graphql-route';
import {
  expectedLoggedInOnlyConditions,
  LIST_CHIP_FIXTURE_LABELS,
  NEW_CUSTOMER_SEED_N_DAYS,
  PROMOTION_UC_PLATFORM_PRODUCT_ID,
  sampleLoggedInOnlyCreatedPromotion,
} from './fixtures/promotion-universal-conditions/data';
import {
  installPromotionUniversalConditionsGraphQLMocks,
  type CreatePromotionCapture,
} from './fixtures/promotion-universal-conditions/graphql-mock';

/**
 * Promotion Logged-In Only — Admin create journey (fixture-e2e).
 * Promoted from e2e/promotion-logged-in-only.fixture.e2e.skeleton.ts
 *
 * Phase 1 (Work Plan Task 1.5 / RF002): Rule L5 emit + UI-L-001 section order.
 * Phase 2 Task 2.3 (AC-020): append list chip text/order asserts after create redirect.
 */

const INDEPENDENCE_NOTE =
  'แยกจากเงื่อนไข「ลูกค้าใหม่」ด้านล่าง — ไม่ต้องเปิดทั้งสองอันหากต้องการแค่สมาชิก';

const MEMBERS_ONLY_CHECKBOX = /ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/;

/** List payload with all three condition chips for UI-L-001 order asserts. */
const CHIP_ORDER_LIST_PROMO = {
  ...sampleLoggedInOnlyCreatedPromotion,
  conditions: JSON.stringify({
    loggedInOnly: { enabled: true },
    newCustomer: { enabled: true, nDays: NEW_CUSTOMER_SEED_N_DAYS },
    productId: PROMOTION_UC_PLATFORM_PRODUCT_ID,
    buyQuantity: 2,
    getQuantity: 1,
  }),
};

async function fillRequiredBasics(page: Page, code: string, name: string) {
  await page.getByLabel('รหัสโปรโมชัน').fill(code);
  await page.getByLabel('ชื่อโปรโมชัน').fill(name);
}

async function assertUiL001SectionOrder(page: Page) {
  const headings = await page.getByRole('heading', { level: 3 }).allTextContents();
  const usageIdx = headings.indexOf('จำกัดการใช้');
  const autoApplyIdx = headings.indexOf('ใช้อัตโนมัติ');
  const membersIdx = headings.indexOf('สมาชิกเท่านั้น');
  const newCustomerIdx = headings.indexOf('ลูกค้าใหม่');
  const scheduleIdx = headings.indexOf('ระยะเวลา');

  expect(usageIdx).toBeGreaterThanOrEqual(0);
  expect(autoApplyIdx).toBe(usageIdx + 1);
  expect(membersIdx).toBe(autoApplyIdx + 1);
  expect(newCustomerIdx).toBe(membersIdx + 1);
  expect(scheduleIdx).toBe(newCustomerIdx + 1);
}

async function assertMembersOnlyControls(page: Page) {
  await expect(page.getByRole('heading', { name: 'สมาชิกเท่านั้น' })).toBeVisible();
  await expect(page.getByText(INDEPENDENCE_NOTE)).toBeVisible();

  const checkbox = page.getByLabel(MEMBERS_ONLY_CHECKBOX);
  await expect(checkbox).toBeVisible();
  await expect(checkbox).toHaveAttribute('type', 'checkbox');

  // UI-L-002 — control is a labeled checkbox, not a Switch
  await expect(page.getByRole('switch')).toHaveCount(0);
}

/**
 * Override PlatformPromotions / StorePromotions so list chips reflect members-only
 * (+ new-customer + BxGy for order). Falls back to the UC GraphQL mock for other ops.
 */
async function installListChipOrderMocks(page: Page) {
  await page.route('**/graphql', async (route) => {
    const body = (route.request().postDataJSON() ?? {}) as {
      operationName?: string;
      query?: string;
    };
    const operation = getGraphQLOperation(body);
    const query = body.query ?? '';

    if (
      operation === 'PlatformPromotions' ||
      operation === 'StorePromotions' ||
      query.includes('platformPromotions') ||
      query.includes('storePromotions')
    ) {
      await fulfillGraphQL(route, {
        platformPromotions: [CHIP_ORDER_LIST_PROMO],
        storePromotions: [{ ...CHIP_ORDER_LIST_PROMO, scope: 'store' }],
      });
      return;
    }

    await route.fallback();
  });
}

async function assertAc020ListChips(page: Page) {
  const chips = page.getByLabel('เงื่อนไขโปรโมชัน');
  await expect(chips).toBeVisible();

  // UI-L-004 — exact members-only chip text
  await expect(
    chips.getByText(LIST_CHIP_FIXTURE_LABELS.loggedInOnly, { exact: true }),
  ).toBeVisible();

  // UI-L-001 chip order: members-only → new-customer → BxGy
  const chipTexts = await chips.locator(':scope > *').allTextContents();
  expect(chipTexts[0]).toBe(LIST_CHIP_FIXTURE_LABELS.loggedInOnly);
  expect(chipTexts[1]).toBe(LIST_CHIP_FIXTURE_LABELS.newCustomer);
  expect(chipTexts[2]).toBe(LIST_CHIP_FIXTURE_LABELS.bxgy(2, 1, PROMOTION_UC_PLATFORM_PRODUCT_ID));
}

test.describe('Promotion logged-in-only admin create fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
  });

  test('Journey: percentage create emits Rule L5 + UI-L-001 section order + AC-020 chips', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });
    await installListChipOrderMocks(page);

    await page.goto('/admin/promotions/new/percentage');

    await assertUiL001SectionOrder(page);
    await assertMembersOnlyControls(page);

    const membersOnlyToggle = page.getByLabel(MEMBERS_ONLY_CHECKBOX);
    await expect(membersOnlyToggle).not.toBeChecked();
    await membersOnlyToggle.check();
    await expect(membersOnlyToggle).toBeChecked();

    await fillRequiredBasics(page, 'MEMBER10', 'สมาชิกเท่านั้น 10%');
    await page.getByLabel('เปอร์เซ็นต์ส่วนลด').fill('10');

    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();

    await expect.poll(() => lastCapture.value).not.toBeNull();
    expect(lastCapture.value?.conditionsParsed).toEqual(expectedLoggedInOnlyConditions);
    expect(lastCapture.value?.conditionsParsed).toMatchObject({
      loggedInOnly: { enabled: true },
    });
    expect(lastCapture.value?.conditionsParsed).not.toHaveProperty('newCustomer');
    expect(lastCapture.value?.input?.type).toBe('percentage');

    await expect(page).toHaveURL(/\/admin\/promotions$/);
    await assertAc020ListChips(page);
  });

  test('Journey: fixed_amount create emits Rule L5 + UI-L-001 + AC-020 chips (second type)', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });
    await installListChipOrderMocks(page);

    await page.goto('/admin/promotions/new/fixed_amount');

    await assertUiL001SectionOrder(page);
    await assertMembersOnlyControls(page);

    await page.getByLabel(MEMBERS_ONLY_CHECKBOX).check();

    await fillRequiredBasics(page, 'MEMBER100', 'สมาชิกเท่านั้น ส่วนลดคงที่');
    // Platform admin create uses order-level baht-off label (not vendor store-subtotal).
    await page.getByLabel('ส่วนลดทั้งออเดอร์ (฿)').fill('100');

    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();

    await expect.poll(() => lastCapture.value).not.toBeNull();
    expect(lastCapture.value?.conditionsParsed).toEqual(expectedLoggedInOnlyConditions);
    expect(lastCapture.value?.input?.type).toBe('fixed_amount');

    await expect(page).toHaveURL(/\/admin\/promotions$/);
    await assertAc020ListChips(page);
  });
});
