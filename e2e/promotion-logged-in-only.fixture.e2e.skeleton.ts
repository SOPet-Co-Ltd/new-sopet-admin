// Promotion Logged-In Only fixture-e2e Test — Admin / Vendor configuration
// Design Doc: promotion-logged-in-only-frontend-design.md
// UI Spec: promotion-logged-in-only-ui-spec.md
// PRD: promotion-logged-in-only-prd.md (AC-001, AC-002, AC-010, AC-011, AC-013–AC-017, AC-020)
// Parent pattern: e2e/promotion-universal-conditions.fixture.e2e.skeleton.ts
// Implement target: e2e/promotion-logged-in-only.fixture.e2e.spec.ts
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 1/3 (admin journey), service-e2e 0/2
//
// Feature fixture-e2e budget (3/3 total): this admin journey + storefront guest reserved
// journey + storefront logged-in / both-on journey
//   (see sopet-storefront/.../promotion-logged-in-only.fixture.e2e.test.tsx).
//
// ---------------------------------------------------------------------------
// Phase 0 fixture / mock stubs (import paths for later journey implementation)
// ---------------------------------------------------------------------------
// Reuse / extend parent promotion-universal-conditions Playwright fixtures where possible:
// Data / GraphQL mocks: e2e/fixtures/promotion-universal-conditions/
//   - installPromotionUniversalConditionsGraphQLMocks(page, { onCreatePromotion })
//   - CreatePromotionCapture.conditionsRaw / conditionsParsed (variables.input.conditions String)
//   - expectedLoggedInOnlyConditions / buildAdminLoggedInOnlyConditions() — Rule L5 golden
//   - expectedLoggedInOnlyAndNewCustomerConditions — both-keys; newCustomer-only omits loggedInOnly
// Auth: authenticateAsAdmin(page) / authenticateAsVendor(page) from e2e/fixtures/taxonomy/admin-auth
// CreatePromotion mock captures variables.input.conditions String → parse Rule L5 JSON
//
// ---------------------------------------------------------------------------
// Journey: Admin/Vendor create with สมาชิกเท่านั้น toggle → Rule L5 emit → list chip
// ---------------------------------------------------------------------------
//
// Journey AC: "Operator opens create form → enables สมาชิกเท่านั้น (independent of ลูกค้าใหม่)
// → save persists exactly loggedInOnly:{enabled:true} → list shows chip สมาชิกเท่านั้น;
// both checkboxes may be on; newCustomer-only omits loggedInOnly (AC-001, AC-010, AC-011,
// AC-013–AC-017, AC-020, UI-L-001, UI-L-002, UI-L-004)"
// Screen transition: S-Admin-Type|S-Vendor-Type → S-*-Create → S-*-List (chips)
// Optional: S-*-List → S-*-Edit prefill checkbox (AC-017)
// ROI: 71 (BV:9 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Authenticated admin on promotion create → assert สมาชิกเท่านั้น section after
// จำกัดการใช้ and before ลูกค้าใหม่ → toggle on → independence note visible → submit →
// createPromotion conditions JSON includes exactly loggedInOnly:{enabled:true} and type
// unchanged → list chip สมาชิกเท่านั้น before new-customer/BxGy chips
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — Playwright GraphQL mocks for createPromotion,
// promotions list; optional edit query for prefill
// @complexity: high
// Primary failure mode: members-only section missing or wrong order; save omits key when on;
// save includes loggedInOnly when off; chip absent; newCustomer requires members-only; Switch
// used instead of checkbox
// Proof obligation: authenticate as admin; mock createPromotion capturing conditions String;
// navigate /admin/promotions/new/percentage (and one other type); assert section order UI-L-001;
// checkbox labeled ใช้ได้เฉพาะสมาชิกที่เข้าสู่ระบบแล้ว; independence note always visible;
// toggle on → submit → assert conditions JSON exactly {"loggedInOnly":{"enabled":true},...}
// with no unknown nested keys; list shows สมาชิกเท่านั้น. Boundary: both checkboxes on → both
// keys; newCustomer-only → omit loggedInOnly (AC-010). Fixture-only GraphQL — no live backend.
// Optional vendor path /vendor/promotions/new/[type] with same control surface.
// Verification points / expected results / pass criteria:
// - สมาชิกเท่านั้น section after จำกัดการใช้, before ลูกค้าใหม่ (all selectable types)
// - Independence note always visible (RF001 / AC-016)
// - Checkbox on → conditions include exactly loggedInOnly:{enabled:true}; type unchanged
// - Checkbox off → loggedInOnly omitted
// - Both on → both keys present; newCustomer-only does not require members-only
// - List chip สมาชิกเท่านั้น before new-customer / BxGy chips (UI-L-001 / UI-L-004)
// - Edit prefill: loggedInOnly.enabled === true → checkbox checked (AC-017)
// - Control is labeled checkbox — no Switch (UI-L-002)
