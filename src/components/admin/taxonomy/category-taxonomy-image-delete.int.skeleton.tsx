// Category Taxonomy Image & Delete integration Test - Design Doc: category-taxonomy-image-delete-frontend-design.md
// Implement target: src/components/admin/taxonomy/category-taxonomy-image-delete.int.test.tsx
// Generated: 2026-07-07 | Budget Used: integration 3/3, fixture-e2e 0/3, service-e2e 0/2
//
// AC1: "When a pending category row has no imageUrl, the Approve button is disabled, shows hint ต้องอัปโหลดรูปภาพก่อนอนุมัติ, and if approve is invoked while disabled is bypassed in test, the UI surfaces backend CATEGORY_IMAGE_REQUIRED Thai message inline (AC-001)"
// ROI: 81 (BV:9 × Freq:8 + Legal:0 + Defect:9)
// Behavior: Render PendingCategoryRow with item.imageUrl null → Approve disabled + hint visible → forced approve mutation error renders Thai CATEGORY_IMAGE_REQUIRED inline
// @category: core-functionality
// @lane: integration
// @dependency: PendingCategoryRow, mocked useSetCategoryImage / useApproveCategory hooks
// @complexity: medium
// Primary failure mode: Approve button enabled without imageUrl, or missing hint/error when backend rejects approval
// Proof obligation: render with TaxonomyItem pending and imageUrl null/empty; assert Approve has disabled state and hint text ต้องอัปโหลดรูปภาพก่อนอนุมัติ with aria-describedby link; simulate mutation reject with extensions.code CATEGORY_IMAGE_REQUIRED and assert inline role=alert Thai message. Boundary: no_image state
// Verification points / expected results / pass criteria:
// - Approve button disabled when !imageUrl?.trim()
// - Hint ต้องอัปโหลดรูปภาพก่อนอนุมัติ visible below ImageUploadField
// - aria-describedby connects Approve to approve-hint-{id}
// - Backend error message displayed when approve attempted with mock rejection
//
// AC2: "When admin uploads a valid image on a pending category row, the UI calls setCategoryImage after uploadImage, shows 80×80 thumbnail, enables Approve, and successful approve moves the row to the approved list (AC-002, AC-017)"
// ROI: 80 (BV:9 × Freq:8 + Legal:0 + Defect:8)
// Behavior: Upload completes → setCategoryImage.mutateAsync called with categories folder URL → row shows thumbnail → Approve enabled → onApprove succeeds
// @category: core-functionality
// @lane: integration
// @dependency: PendingCategoryRow, ImageUploadField (mock upload), useSetCategoryImage, useApproveCategory
// @complexity: medium
// Primary failure mode: upload URL not passed to setCategoryImage; Approve stays disabled after successful upload; thumbnail not rendered
// Proof obligation: mock ImageUploadField/useImageUpload to emit valid categories/ URL; assert setCategoryImage called with { categoryId, imageUrl }; re-render with updated item.imageUrl; assert Approve enabled and h-20 w-20 preview present; click Approve and assert onApprove fired. Traverses upload-then-set sequence boundary (must not skip setCategoryImage)
// Verification points / expected results / pass criteria:
// - setCategoryImage invoked after upload with folder categories URL
// - Approve enabled when imageUrl present
// - Thumbnail 80×80 visible (AC-017)
// - ImageUploadField uses folder="categories" and showUrl={false} on row
//
// AC3: "When deleting a category with productCount > 0, step 2 Next is disabled until replacement selected; step 3 confirms deleteCategory with replacement; product list cap 10 with overflow text (AC-008, AC-009, AC-016)"
// ROI: 80 (BV:10 × Freq:7 + Legal:0 + Defect:10)
// Behavior: CategoryDeleteDialog open → impact step shows ≤10 product names + และอีก N รายการ → replacement step blocks Next until select → confirm calls deleteCategory with replacementCategoryId → closes on success
// @category: core-functionality
// @lane: integration
// @dependency: CategoryDeleteDialog, mocked useCategoryDeleteImpact, useDeleteCategory, useApprovedCategories
// @complexity: high
// Primary failure mode: wizard skips replacement step, Next enabled without selection, overflow text missing when count>10, deleteCategory called without replacementCategoryId when products bound
// Proof obligation: MSW/mock impact with productCount=12 and 10 product summaries; assert 10 names + และอีก 2 รายการ; navigate to replacement step; assert Next disabled until Radix Select value set; assert inline เลือกหมวดหมู่ทดแทน on invalid Next attempt; confirm step calls deleteCategory({ id, replacementCategoryId }) and onOpenChange(false). Boundary: productCount>10 cap and replacement required branch
// Verification points / expected results / pass criteria:
// - Step 1 lists max 10 product names sorted by name
// - Overflow copy และอีก {productCount-10} รายการ when count > 10
// - Step 2 Next disabled until replacementCategoryId selected; options exclude self
// - Step 3 deleteCategory mutation includes replacementCategoryId
// - Dialog closes and delete loading state กำลังลบ... while pending
