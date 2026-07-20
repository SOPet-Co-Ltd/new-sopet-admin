// Search & Taxonomy Fixes — Admin Category Delete Wizard [fixture-e2e] Test
// Design Doc: search-taxonomy-fixes-frontend-design.md
// UI Spec: search-taxonomy-fixes-ui-spec.md
// PRD: search-taxonomy-fixes-prd.md (Bundle D2 — AC-031, AC-032, AC-033, AC-017)
// Generated: 2026-07-11 | Budget Used: integration 0/3, fixture-e2e 1/3 (reserved slot), service-e2e 0/2
//
// Implement target: e2e/search-taxonomy-delete.fixture.e2e.spec.ts
//
// Journey: S-04 Admin Taxonomy → S-06 Category Delete Wizard → S-04 list refresh
// ROI: 85 (BV:10 × Freq:8 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step journey)
// Behavior: admin on /admin/taxonomy → delete category with bound products → impact step →
// select replacement → confirm → category removed from list; zero-product category skips step 2
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — Playwright + GraphQL fixtures from e2e/fixtures/taxonomy/
// @complexity: high
// Primary failure mode: wizard stub returns null in browser; replacement not required in UI;
// delete succeeds without replacementCategoryId payload; deleted category still visible after refresh
// Proof obligation: authenticate as admin; fixture categoryDeleteImpact productCount=3 with product
// names; intercept deleteCategory assert body includes replacementCategoryId; complete steps
// ถัดไป → เลือกหมวดหมู่ทดแทน → ลบหมวดหมู่; assert category name absent from page. Separate case:
// productCount=0 skips step 2 → confirm only. Fixture-only GraphQL — no live backend. Boundary:
// productCount>0 full wizard vs AC-017 zero-product path
// Verification points / expected results / pass criteria:
// - Step 1 shows impact intro หมวดหมู่นี้มีสินค้า {count} รายการ and product name list
// - Step 2 Next disabled until replacement selected from approved categories (excluding self) (AC-033)
// - Step 3 confirm body includes replacement name and product count
// - deleteCategory GraphQL variables include id and replacementCategoryId (AC-032)
// - Deleted category no longer visible on /admin/taxonomy after success
// - Zero-product category: step 1 → confirm without replacement step (AC-017)
//
// ---------------------------------------------------------------------------
// Journey AC2: "Rejected categories and tags visible with delete-only actions (AC-029, AC-030)"
// ROI: 55 (BV:8 × Freq:6 + Legal:0 + Defect:7)
// Behavior: admin taxonomy page loads rejectedCategories/rejectedTags fixtures → rejected cards
// render below pending → rows show Delete only (no Approve/Reject); empty states when []
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — e2e/fixtures/taxonomy/graphql-mock.ts
// @complexity: medium
// Primary failure mode: rejected sections missing; approve/reject on rejected rows; empty state errors
// Proof obligation: stub rejected queries with ≥1 category and ≥1 tag; navigate /admin/taxonomy;
// assert card titles หมวดหมู่ที่ปฏิเสธแล้ว and แท็กที่ปฏิเสธแล้ว; assert Delete visible and
// Approve/Reject absent; stub [] and assert ไม่มีหมวดหมู่ที่ปฏิเสธ / ไม่มีแท็กที่ปฏิเสธ
// Verification points / expected results / pass criteria:
// - Rejected sections below pending lists on categories and tags tabs
// - Rejected rows display status ปฏิเสธแล้ว and single ลบ action
// - No Approve or Reject on rejected rows
// - Empty states match UI Spec Thai copy without GraphQL error page
//
// ---------------------------------------------------------------------------
// Journey AC3: "Pending category approve blocked without image (AC-034, AC-035)"
// ROI: 63 (BV:8 × Freq:7 + Legal:0 + Defect:7)
// Behavior: /admin/taxonomy → หมวดหมู่รออนุมัติ → Approve disabled until image uploaded →
// hint ต้องอัปโหลดรูปภาพก่อนอนุมัติ visible
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — PendingCategoryRow, upload fixtures
// @complexity: medium
// Primary failure mode: approve enabled without image; missing hint copy; setCategoryImage not called
// Proof obligation: fixture pending category without imageUrl; assert Approve disabled and hint
// visible; mock upload → setCategoryImage → Approve enabled and succeeds.
// Verification points / expected results / pass criteria:
// - Approve button disabled when imageUrl absent (AC-034)
// - Hint ต้องอัปโหลดรูปภาพก่อนอนุมัติ visible with aria-describedby (AC-035)
// - After upload fixture, Approve enabled
// - approveCategory mutation called only after image set
