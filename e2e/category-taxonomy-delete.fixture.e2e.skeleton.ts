// Category Taxonomy Image & Delete fixture-e2e Test - Design Doc: category-taxonomy-image-delete-frontend-design.md + UI Spec: category-taxonomy-image-delete-ui-spec.md
// Implement target: e2e/category-taxonomy-delete.fixture.e2e.spec.ts
// Generated: 2026-07-07 | Budget Used: integration 0/3, fixture-e2e 3/3, service-e2e 0/2
//
// Journey AC1: "Multi-step category delete with reassignment when products bound (AC-007, AC-008, AC-009, AC-016) — S-01 → S-02 wizard → S-01 list refresh"
// ROI: 85 (BV:10 × Freq:8 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step journey)
// Behavior: Admin on /admin/taxonomy → Delete category with bound products → impact step → select replacement → confirm → category removed from list
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — Playwright route interception or GraphQL fixture for categoryDeleteImpact, deleteCategory, taxonomy lists
// @complexity: high
// Primary failure mode: wizard step skipped in browser, replacement not required in UI, delete succeeds without reassignment payload, deleted category still visible after refresh
// Proof obligation: authenticate as admin; fixture categoryDeleteImpact with productCount=3 and product names; intercept deleteCategory and assert request body includes replacementCategoryId; complete steps ถัดไป → เลือกหมวดหมู่ทดแทน → ลบหมวดหมู่; assert category name absent from page and success invalidation (list refresh). Use fixture-only GraphQL — no live backend. Boundary: productCount>0 full wizard path
// Verification points / expected results / pass criteria:
// - Step 1 shows impact intro หมวดหมู่นี้มีสินค้า {count} รายการ and product name list
// - Step 2 Next disabled until replacement selected from approved categories (excluding self)
// - Step 3 confirm body includes replacement name and product count
// - deleteCategory GraphQL variables include id and replacementCategoryId
// - Deleted category no longer visible on /admin/taxonomy after success
//
// Journey AC2: "Pending category image upload enables approve and moves row to approved list (AC-001, AC-002, AC-004) — admin create → upload → approve"
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:9)
// Behavior: Create category name only → success สร้างแล้ว (รออนุมัติ) in pending → upload image → Approve enabled → approve → row in approved list with thumbnail
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — fixtures for createCategory, uploadImage, setCategoryImage, approveCategory, pending/approved queries
// @complexity: high
// Primary failure mode: new category appears in approved list immediately; Approve stays disabled after fixture upload; setCategoryImage not called after upload
// Proof obligation: intercept createCategory to return approvalStatus pending; assert create card copy สร้างหมวดหมู่ without auto-approve text; fixture upload returning categories/ URL; assert setCategoryImage then approveCategory sequence via network stubs; assert row moves from pending to approved sections. Boundary: always-pending admin create regression (AC-004)
// Verification points / expected results / pass criteria:
// - Success message สร้างแล้ว (รออนุมัติ) after admin create
// - New item in pending list only (not approved)
// - Approve disabled until imageUrl set; hint ต้องอัปโหลดรูปภาพก่อนอนุมัติ when no image
// - After upload+setCategoryImage, Approve enabled and succeeds
// - Approved list shows category with 80×80 thumbnail
//
// Journey AC3: "Rejected categories and tags visible with delete-only actions (AC-015, AC-010) — S-04 rejected sections"
// ROI: 36 (BV:6 × Freq:5 + Legal:0 + Defect:6)
// Behavior: Admin taxonomy page loads rejectedCategories/rejectedTags fixtures → rejected cards render below pending → rows show Delete only (no Approve/Reject)
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — fixtures for rejectedCategories, rejectedTags queries
// @complexity: medium
// Primary failure mode: rejected sections missing, wrong card titles, approve/reject buttons shown on rejected rows, empty state not shown when no rejected items
// Proof obligation: stub rejected queries with ≥1 category and ≥1 tag; navigate /admin/taxonomy both tabs; assert card titles หมวดหมู่ที่ปฏิเสธแล้ว and แท็กที่ปฏิเสธแล้ว; assert Delete visible and Approve/Reject absent on rejected rows; stub empty arrays and assert empty copy ไม่มีหมวดหมู่ที่ปฏิเสธ / ไม่มีแท็กที่ปฏิเสธ. Boundary: rejected-only action set
// Verification points / expected results / pass criteria:
// - Rejected sections positioned below pending lists on categories and tags tabs
// - Rejected rows display status ปฏิเสธแล้ว and single ลบ action
// - No Approve or Reject controls on rejected rows
// - Empty states match UI Spec Thai copy
// - Delete opens CategoryDeleteDialog or TagDeleteDialog respectively
