import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { fulfillGraphQL, getGraphQLOperation } from './fixtures/graphql-route';
import { sampleCreatedPromotion } from './fixtures/promotion-universal-conditions/data';
import {
  installPromotionUniversalConditionsGraphQLMocks,
  type CreatePromotionCapture,
} from './fixtures/promotion-universal-conditions/graphql-mock';

/**
 * Promotion Auto-Apply — Admin create journey (fixture-e2e).
 * Promoted from e2e/promotion-auto-apply.fixture.e2e.skeleton.ts
 *
 * Work Plan Task 1.4 / AC-001, AC-003, AC-004, AC-024, UI-AA-001–003.
 * (AC-002 edit prefill optional — deferred per skeleton Proof obligation.)
 */

const SECTION_DESCRIPTION =
  'เมื่อเปิด ระบบจะเลือกโปรโมชันอัตโนมัติที่ดีที่สุดให้ลูกค้าครั้งแรกที่เข้าหน้าชำระเงินในเซสชันนั้น ลูกค้าเปลี่ยนหรือลบส่วนลดได้เอง';

const AUTO_APPLY_CHECKBOX = /ใช้อัตโนมัติที่หน้าชำระเงิน/;
const OFF_HINT = 'ปิดอยู่ = ลูกค้าต้องเลือกหรือกรอกโค้ดเอง';
const LIST_BADGE = 'ใช้อัตโนมัติ';

/** List payload after create with autoApply enabled (AC-004 badge). */
const AUTO_APPLY_LIST_PROMO = {
  ...sampleCreatedPromotion,
  id: 'promo-aa-created-1',
  code: 'AUTO10',
  name: 'ใช้อัตโนมัติ 10%',
  type: 'percentage',
  discountValue: 10,
  autoApply: true,
  conditions: null as string | null,
};

async function fillRequiredBasics(page: Page, code: string, name: string) {
  await page.getByLabel('รหัสโปรโมชัน').fill(code);
  await page.getByLabel('ชื่อโปรโมชัน').fill(name);
}

/** UI-AA-002 — section order after จำกัดการใช้. */
async function assertUiAa002SectionOrder(page: Page) {
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

/** UI-AA-001 / UI-AA-003 / AC-001 / AC-024 — control surface + Thai copy. */
async function assertAutoApplyControls(page: Page) {
  await expect(page.getByRole('heading', { name: 'ใช้อัตโนมัติ' })).toBeVisible();
  await expect(page.getByText(SECTION_DESCRIPTION)).toBeVisible();

  const checkbox = page.getByLabel(AUTO_APPLY_CHECKBOX);
  await expect(checkbox).toBeVisible();
  await expect(checkbox).toHaveAttribute('type', 'checkbox');
  await expect(checkbox).not.toBeChecked();
  await expect(page.getByText(OFF_HINT)).toBeVisible();

  // UI-AA-001 — labeled checkbox, not Switch
  await expect(page.getByRole('switch')).toHaveCount(0);
}

/**
 * Override PlatformPromotions so list badge reflects autoApply true after create.
 * Falls back to the UC GraphQL mock for other operations.
 */
async function installAutoApplyListMocks(page: Page) {
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
        platformPromotions: [AUTO_APPLY_LIST_PROMO],
        storePromotions: [{ ...AUTO_APPLY_LIST_PROMO, scope: 'store' }],
      });
      return;
    }

    await route.fallback();
  });
}

test.describe('Promotion auto-apply admin create fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
  });

  test('Journey: percentage create enables autoApply → payload true → list badge', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });
    await installAutoApplyListMocks(page);

    await page.goto('/admin/promotions/new/percentage');

    await assertUiAa002SectionOrder(page);
    await assertAutoApplyControls(page);

    const autoApplyToggle = page.getByLabel(AUTO_APPLY_CHECKBOX);
    await autoApplyToggle.check();
    await expect(autoApplyToggle).toBeChecked();
    await expect(page.getByText(OFF_HINT)).toHaveCount(0);

    await fillRequiredBasics(page, 'AUTO10', 'ใช้อัตโนมัติ 10%');
    await page.getByLabel('เปอร์เซ็นต์ส่วนลด').fill('10');

    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();

    await expect.poll(() => lastCapture.value).not.toBeNull();
    expect(lastCapture.value?.input?.autoApply).toBe(true);
    expect(lastCapture.value?.input?.type).toBe('percentage');

    await expect(page).toHaveURL(/\/admin\/promotions$/);
    await expect(page.getByText(LIST_BADGE, { exact: true })).toBeVisible();
  });

  test('Journey: fixed_amount create enables autoApply → payload true → list badge (second type)', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });
    await installAutoApplyListMocks(page);

    await page.goto('/admin/promotions/new/fixed_amount');

    await assertUiAa002SectionOrder(page);
    await assertAutoApplyControls(page);

    const autoApplyToggle = page.getByLabel(AUTO_APPLY_CHECKBOX);
    await autoApplyToggle.check();
    await expect(autoApplyToggle).toBeChecked();
    await expect(page.getByText(OFF_HINT)).toHaveCount(0);

    await fillRequiredBasics(page, 'AUTO100', 'ใช้อัตโนมัติ ส่วนลดคงที่');
    await page.getByLabel('ส่วนลดทั้งออเดอร์ (฿)').fill('100');

    await page.getByRole('button', { name: 'สร้างโปรโมชัน' }).click();

    await expect.poll(() => lastCapture.value).not.toBeNull();
    expect(lastCapture.value?.input?.autoApply).toBe(true);
    expect(lastCapture.value?.input?.type).toBe('fixed_amount');

    await expect(page).toHaveURL(/\/admin\/promotions$/);
    await expect(page.getByText(LIST_BADGE, { exact: true })).toBeVisible();
  });
});
