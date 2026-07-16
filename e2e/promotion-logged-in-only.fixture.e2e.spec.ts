import { test, expect, type Page } from '@playwright/test';
import { authenticateAsAdmin } from './fixtures/taxonomy/admin-auth';
import { expectedLoggedInOnlyConditions } from './fixtures/promotion-universal-conditions/data';
import {
  installPromotionUniversalConditionsGraphQLMocks,
  type CreatePromotionCapture,
} from './fixtures/promotion-universal-conditions/graphql-mock';

/**
 * Promotion Logged-In Only — Admin create journey (fixture-e2e).
 * Promoted from e2e/promotion-logged-in-only.fixture.e2e.skeleton.ts
 *
 * Phase 1 scope (Work Plan Task 1.5 / RF002):
 * - Rule L5 emit: conditions String includes exactly `loggedInOnly: { enabled: true }`
 * - UI-L-001 section order: จำกัดการใช้ → สมาชิกเท่านั้น → ลูกค้าใหม่ → ระยะเวลา
 * - Independence note + checkbox (no Switch)
 *
 * AC-020 / list chip text/order asserts are deferred to Phase 2 Task 2.3 — do not add here.
 */

const INDEPENDENCE_NOTE =
  'แยกจากเงื่อนไข「ลูกค้าใหม่」ด้านล่าง — ไม่ต้องเปิดทั้งสองอันหากต้องการแค่สมาชิก';

const MEMBERS_ONLY_CHECKBOX = /ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว/;

async function fillRequiredBasics(page: Page, code: string, name: string) {
  await page.getByLabel('รหัสโปรโมชัน').fill(code);
  await page.getByLabel('ชื่อโปรโมชัน').fill(name);
}

async function assertUiL001SectionOrder(page: Page) {
  const headings = await page.getByRole('heading', { level: 3 }).allTextContents();
  const usageIdx = headings.indexOf('จำกัดการใช้');
  const membersIdx = headings.indexOf('สมาชิกเท่านั้น');
  const newCustomerIdx = headings.indexOf('ลูกค้าใหม่');
  const scheduleIdx = headings.indexOf('ระยะเวลา');

  expect(usageIdx).toBeGreaterThanOrEqual(0);
  expect(membersIdx).toBe(usageIdx + 1);
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

test.describe('Promotion logged-in-only admin create fixture-e2e', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
  });

  test('Journey: percentage create emits Rule L5 + UI-L-001 section order (no chip asserts)', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });

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

    // Redirect after create — list chips (AC-020) intentionally not asserted in Phase 1
    await expect(page).toHaveURL(/\/admin\/promotions$/);
  });

  test('Journey: fixed_amount create emits Rule L5 + UI-L-001 (second type; no chip asserts)', async ({
    page,
  }) => {
    const lastCapture: { value: CreatePromotionCapture | null } = { value: null };

    await installPromotionUniversalConditionsGraphQLMocks(page, {
      onCreatePromotion: (capture) => {
        lastCapture.value = capture;
      },
    });

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
  });
});
