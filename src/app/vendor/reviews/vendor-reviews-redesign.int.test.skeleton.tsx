// Vendor Reviews Page Redesign — integration Test Skeleton - Design Doc: vendor-reviews-redesign-frontend-design.md
// UI Spec: vendor-reviews-redesign-ui-spec.md
// Generated: 2026-07-10 | Budget Used: integration 3/3, fixture-e2e (see e2e/vendor-reviews-redesign.fixture.e2e.skeleton.ts), service-e2e 0/2
//
// Implement target: src/app/vendor/reviews/vendor-reviews-redesign.int.test.tsx
//
// Harness: Vitest + RTL + user-event; mock `@/hooks/useReviews` and `@/hooks/useVendorStoreId` at module boundary (per Design Doc Test Boundaries).
// @real-dependency: StatCard, RankedList, RatingDistributionChart, VendorReviewSummarySection, VendorReviewProductBreakdown, VendorReviewFilters, VendorReplySection, VendorReplyForm (render real extracted/presentation components — do not mock internal UI).
//
// Existing coverage (update during implementation — not additional budget):
//   vendor-reply-form.test.tsx — direct VendorReplyForm unit tests remain unchanged (AC-015).
//   VendorReviewListItem describe block — expand reply section before asserting form/textarea visibility (AC-015).
//
// ---------------------------------------------------------------------------
// AC-003: "When the user selects reply-status 'ยังไม่ตอบ', the system shall show only reviews where reply is null/undefined without an API call"
// AC-004: "When the user selects a rating filter (e.g. '5 ดาว'), the system shall show only reviews with matching rating"
// AC-005: "When both filters are active, the system shall apply AND logic"
// AC-013: "If filters exclude all reviews, then the system shall display 'ไม่พบรีวิวที่ตรงกับตัวกรอง'"
// ROI: 89 (BV:9 × Freq:9 + Legal:0 + Defect:8)
// Behavior: render VendorReviewsPage with storeId + mixed fixture reviews (replied/unreplied, ratings 3–5) → change reply-status Select to "ยังไม่ตอบ" → only unreplied cards remain → add rating Select "5 ดาว" → AND subset shown → combine filters that match zero rows → empty copy appears; assert no additional hook refetch between filter changes.
// @category: core-functionality
// @lane: integration
// @dependency: VendorReviewsPage, VendorReviewFilters, mocked useStoreProductReviews + useStoreReviewSummary + useVendorStoreId
// @complexity: high
// Primary failure mode: OR logic instead of AND; filter triggers API refetch; wrong Thai empty message; replied reviews still visible under "ยังไม่ตอบ".
// Proof obligation: fixture array with at least one review matching each filter quadrant; drive `#reviews-reply-filter` and `#reviews-rating-filter` (labels "สถานะการตอบกลับ", "กรองตามคะแนน"); assert visible product names match expected subset only; assert hook fetch functions not called again after initial render; boundary path — active both filters with zero intersection must show "ไม่พบรีวิวที่ตรงกับตัวกรอง" (not "ยังไม่มีรีวิว").
// Verification points / expected results / pass criteria:
//   - Reply filter "ยังไม่ตอบ" hides all reviews with `reply`.
//   - Rating filter "5 ดาว" hides non-5-star reviews.
//   - Combined filters apply AND logic (stable source order preserved).
//   - Zero-match state shows "ไม่พบรีวิวที่ตรงกับตัวกรอง".
//   - No GraphQL/hook refetch on filter change (client-side only).
//   - Fail if wrong subset, wrong empty copy, or API invoked on filter change.
//
// ---------------------------------------------------------------------------
// AC-007: "While the reply section is collapsed and no reply exists, the system shall show only a 'ตอบกลับ' outline button"
// AC-007: "When the user clicks 'ตอบกลับ' or 'แก้ไข', the system shall expand the section with aria-expanded={true} and render VendorReplyForm"
// AC-007: "When the user clicks 'ยกเลิก' on an expanded section without a saved reply, the system shall collapse and discard the draft"
// AC-008: "While the reply section is collapsed and a reply exists, the system shall show a truncated preview, timestamp, and 'แก้ไข' button — no delete control"
// AC-008: "When the user clicks 'ซ่อน' on an expanded section with a saved reply, the system shall collapse to preview and reset draft to reply.body"
// AC-008: "When reply save succeeds, the system shall collapse to preview variant and show updated body"
// ROI: 81 (BV:9 × Freq:8 + Legal:0 + Defect:9)
// Behavior: render VendorReplySection in isolation — (A) no reply: collapsed shows "ตอบกลับ" only, no textarea → click expand → form visible, aria-expanded true, panel id `vendor-reply-panel-{reviewId}` → type draft → "ยกเลิก" collapses, draft cleared; (B) with reply: preview shows "คำตอบของร้าน", line-clamp body, "แก้ไข" → expand → edit → "ซ่อน" returns to preview with original body; (C) mock successful update → onSaveSuccess collapses to preview with new body; assert no delete button in any state.
// @category: core-functionality
// @lane: integration
// @dependency: VendorReplySection, VendorReplyForm, mocked useCreateReviewReply + useUpdateReviewReply
// @complexity: high
// Primary failure mode: form visible on mount (pre-redesign regression); aria-expanded not toggled; cancel keeps draft; hide leaves edited draft in preview; delete control appears.
// Proof obligation: traverse collapsed-no-reply → expanded-create → cancel → collapsed-no-reply and collapsed-preview → expanded-edit → hide → collapsed-preview state paths; assert VendorReplyForm mounted only when expanded; toggle button aria-controls matches panel id; save-success path via mocked mutateAsync resolving then callback collapse. Boundary paths: cancel without saved reply vs hide with saved reply.
// Verification points / expected results / pass criteria:
//   - Default collapsed: no "ตอบกลับรีวิว" label / textarea until expand click.
//   - Expand sets aria-expanded="true"; collapse sets false.
//   - Preview variant: "คำตอบของร้าน", truncated body, "แก้ไข", no delete.
//   - Cancel discards unsaved draft; Hide resets to reply.body.
//   - Successful save collapses to preview with updated text.
//   - Fail if form always visible, wrong aria state, or delete rendered.
//
// ---------------------------------------------------------------------------
// AC-001: "When summary data loads with a valid storeId, the system shall render average rating (1 decimal), StarRating, review count, and horizontal distribution bars for ratings 5→1"
// AC-002: "When productBreakdown contains items, the system shall render a ranked list with product name (truncated), star rating, average (1 decimal), and review count — with no product links"
// AC-011: "No external product links (productSlug unused)"
// ROI: 79 (BV:8 × Freq:9 + Legal:0 + Defect:7)
// Behavior: render VendorReviewSummarySection + VendorReviewProductBreakdown with fixture StoreReviewSummary (averageRating 4.3, reviewCount 42, ratingCounts, productBreakdown sorted by reviewCount desc) → assert StatCard values, distribution aria-label "การกระจายคะแนนรีวิว", bar labels 5→1; breakdown header "รีวิวตามสินค้า", RankedList rows with plain text product names (no anchor/href), StarRating + "{n} รีวิว"; empty breakdown renders RankedList "ยังไม่มีข้อมูล".
// @category: core-functionality
// @lane: integration
// @dependency: VendorReviewSummarySection, VendorReviewProductBreakdown, StatCard, RankedList, RatingDistributionChart
// @complexity: medium
// Primary failure mode: productBreakdown still omitted; distribution bars missing or wrong percentages; product names link to storefront; averages not 1-decimal formatted.
// Proof obligation: pass literal summary fixture independent of mapper defaults; assert computed bar widths reflect ratingNCount/reviewCount; query breakdown section for absence of `<a>` around product names and absence of productSlug usage. Boundary path: empty productBreakdown array → "ยังไม่มีข้อมูล".
// Verification points / expected results / pass criteria:
//   - Average displays one decimal (e.g. "4.3") with StarRating component present.
//   - Review count StatCard shows total from fixture.
//   - Distribution container has aria-label "การกระจายคะแนนรีวิว"; levels 5→1 labeled "{n} ดาว".
//   - Breakdown rows ranked by reviewCount descending; secondary shows count label.
//   - Product names are plain text only (no links).
//   - Empty breakdown shows "ยังไม่มีข้อมูล".
//   - Fail if breakdown hidden, bars absent, or slug links rendered.
