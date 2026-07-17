// Promotion Universal Conditions fixture-e2e Test — Admin / Vendor configuration
// Design Doc: promotion-universal-conditions-frontend-design.md
// UI Spec: promotion-universal-conditions-ui-spec.md
// PRD: promotion-universal-conditions-prd.md (AC-017, AC-023, AC-030–032, AC-034, UI-D-001)
// Implement target: e2e/promotion-universal-conditions.fixture.e2e.spec.ts
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 1/3 (slot 2 of feature budget), service-e2e 0/2
//
// Feature fixture-e2e budget (3/3 total): storefront reserved guest journey + this admin journey
// + storefront BxGy/fixed journey (see storefront companion file).
//
// ---------------------------------------------------------------------------
// Phase 0 fixture / mock stubs (import paths for later journey implementation)
// ---------------------------------------------------------------------------
// Data:           e2e/fixtures/promotion-universal-conditions/data.ts
// GraphQL mocks:  e2e/fixtures/promotion-universal-conditions/graphql-mock.ts
//   - installPromotionUniversalConditionsGraphQLMocks(page, options?)
//   - PRODUCTS_QUERY / Products: platform — storeId NOT required
//     (platformProductsMockRequiresStoreId() === false)
//   - VendorProducts / Products+storeId: vendor store-scoped
//     (vendorProductsMockIsStoreScoped() === true)
//   - CreatePromotion: captures variables.input.conditions String → parse ADR JSON
// Auth (admin harness — not storefront useAuth):
//   - Admin create: authenticateAsAdmin(page) from e2e/fixtures/taxonomy/admin-auth
//   - Vendor create: authenticateAsVendor(page) + localStorage sopet-vendor-store.activeStoreId
// Storefront auth guest vs logged-in (for checkout journeys) lives in storefront
//   src/test/mocks/fixtures/promotion-universal-conditions.ts → AUTH_MOCK_USAGE
//
// ---------------------------------------------------------------------------
// Journey: Admin/Vendor create promotion with new-customer + BxGy product validation
// ---------------------------------------------------------------------------
//
// Journey AC: "Operator opens create form → enables new-customer (N seeds 30) → for BxGy
// selects mandatory product → invalid N / missing product block save → valid save persists
// conditions and list shows chips (AC-001, AC-017, AC-023, AC-030–032, AC-034, UI-D-001)"
// Screen transition: S-Admin-Type|S-Vendor-Type → S-*-Create → S-*-List (chips)
// ROI: 79 (BV:10 × Freq:7 + Legal:0 + Defect:9)
// Behavior: Authenticated admin (and vendor scope variant) on promotion create → toggle
// ลูกค้าใหม่ → N=30 seeded → BxGy without product shows FieldError → pick product + valid N →
// save → list chips ลูกค้าใหม่ ≤ {N} วัน and ซื้อ {X} แถม {Y}
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — Playwright GraphQL mocks for createPromotion,
// products search (platform global / vendor store-scoped), promotions list
// @complexity: high
// Primary failure mode: new-customer section missing on a type; N not seeded on enable; save
// succeeds without productId; fixed_amount copy still says per-product; list chips absent after save
// Proof obligation: authenticate as admin; fixture PRODUCTS_QUERY (no required storeId) and
// createPromotion capturing conditions String; navigate /admin/promotions/new/buy_x_get_y;
// assert ลูกค้าใหม่ section; toggle on → N input shows 30; submit without product → alert
// กรุณาเลือกสินค้าสำหรับโปรซื้อแถม; select published product; set X/Y; submit → assert
// createPromotion variables.conditions JSON includes newCustomer:{enabled:true,nDays:30} and
// productId; list shows chips. Repeat fixed_amount type for scope-aware baht-off label.
// Optional vendor path /vendor/promotions/new/buy_x_get_y with store-scoped product fixture.
// Fixture-only GraphQL — no live backend. Boundary: client Zod gate before submit
// Verification points / expected results / pass criteria:
// - New-customer section visible for percentage, fixed_amount, and buy_x_get_y creates
// - Toggle off→on with empty N seeds 30; invalid N blocks save with role=alert FieldError
// - BxGy missing productId blocks save; required error copy matches UI Spec Thai
// - Successful save conditions include productId, buyQuantity, getQuantity, newCustomer
// - List chips: ลูกค้าใหม่ ≤ 30 วัน and ซื้อ {X} แถม {Y} · {name|id}
// - fixed_amount form shows order/store-subtotal baht-off labels (not per-product)
// - Platform picker query does not require storeId; vendor picker is store-scoped
