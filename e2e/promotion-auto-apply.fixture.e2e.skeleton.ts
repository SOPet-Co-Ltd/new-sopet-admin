// Promotion Auto-Apply fixture-e2e Test — Admin / Vendor AutoApplyFields configuration
// Design Doc: promotion-auto-apply-frontend-design.md
// UI Spec: promotion-auto-apply-ui-spec.md (UI-AA-001–003, AC-001–004, AC-024)
// PRD: promotion-auto-apply-prd.md (AC-001–AC-004, AC-024; Rule AA6)
// ADR: ADR-0008-promotion-auto-apply-checkout.md
// Parent pattern: e2e/promotion-logged-in-only.fixture.e2e.skeleton.ts
// Implement target: e2e/promotion-auto-apply.fixture.e2e.spec.ts
// Promoted: e2e/promotion-auto-apply.fixture.e2e.spec.ts (Phase 1 Task 1.4)
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 1/3 (admin journey),
// service-e2e 0/2
//
// Feature fixture-e2e budget (3/3 total): this admin journey + storefront Journey 1
// (reserved) + storefront Journey 2
//   (see sopet-storefront/.../promotion-auto-apply.fixture.e2e.skeleton.tsx).
//
// ---------------------------------------------------------------------------
// Phase 0 fixture / mock stubs (import paths for later journey implementation)
// ---------------------------------------------------------------------------
// Reuse / extend parent promotion-universal-conditions Playwright fixtures where possible:
// Data / GraphQL mocks: e2e/fixtures/promotion-universal-conditions/
//   - installPromotionUniversalConditionsGraphQLMocks(page, { onCreatePromotion })
//   - CreatePromotionCapture for variables.input.autoApply boolean
// Auth: authenticateAsAdmin(page) / authenticateAsVendor(page) from e2e/fixtures/taxonomy/admin-auth
// List badge: existing platform/vendor list item renders ใช้อัตโนมัติ when autoApply true
//
// ---------------------------------------------------------------------------
// Journey: Admin/Vendor create with AutoApplyFields → persist autoApply → list badge
// ---------------------------------------------------------------------------
//
// Journey AC: "Operator opens create form → sees ใช้อัตโนมัติ after จำกัดการใช้ and before
// สมาชิกเท่านั้น (default off + Thai help) → enables checkbox → save persists
// autoApply:true → list shows badge ใช้อัตโนมัติ; edit with true prefills checked; save off
// persists false (AC-001, AC-002, AC-003, AC-004, AC-024, UI-AA-001, UI-AA-002, UI-AA-003)"
// Screen transition: S-Admin-List|S-Vendor-List → S-*-Create → S-*-List (badge);
// optional S-*-Edit prefill (AC-002)
// ROI: 71 (BV:9 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Authenticated admin on promotion create → assert AutoApplyFields section order
// and normative Thai copy → checkbox off by default → toggle on → submit → createPromotion
// input.autoApply === true → list badge ใช้อัตโนมัติ visible
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — Playwright GraphQL mocks for createPromotion /
// updatePromotion / promotions list; AutoApplyFields inside PromotionFormFields
// @complexity: medium
// Primary failure mode: section missing or wrong order (after members-only); Switch used;
// default checked; save omits autoApply:true; help copy missing; list badge absent when true
// Proof obligation: authenticate as admin; mock createPromotion capturing input.autoApply;
// navigate /admin/promotions/new/percentage (and one other type); assert heading ใช้อัตโนมัติ
// after จำกัดการใช้ and before สมาชิกเท่านั้น; checkbox labeled ใช้อัตโนมัติที่หน้าชำระเงิน
// unchecked; section description + off-hint visible; no Switch; check → submit →
// assert autoApply true on mutation; list shows ใช้อัตโนมัติ. Optional: edit route prefill
// checked when fixture autoApply true; uncheck → update autoApply false. Optional vendor
// /vendor/promotions/new/[type] same control surface. Fixture-only GraphQL — no live backend.
// Verification points / expected results / pass criteria:
// - Section order: จำกัดการใช้ → ใช้อัตโนมัติ → สมาชิกเท่านั้น (UI-AA-002)
// - Create default: checkbox unchecked (AA6 / AC-001)
// - Normative Thai: section description + checkbox label + off-hint (AC-024 / UI-AA-003)
// - Control is labeled checkbox — no Switch (UI-AA-001)
// - Checkbox on → create/update payload autoApply: true (AC-003)
// - Optional: Edit autoApply true → checkbox checked; save off → autoApply: false (AC-002)
// - List badge ใช้อัตโนมัติ when saved true (AC-004 regression)
