// Product Reviews Vendor Reply — Admin Vendor Reply [fixture-e2e] Test Skeleton - Design Doc: product-reviews-vendor-reply-frontend-design.md
// Backend Design Doc: product-reviews-vendor-reply-backend-design.md | UI Spec: product-reviews-vendor-reply-ui-spec.md
// Generated: 2026-07-10 | Budget Used (feature): integration 3/3 (backend), fixture-e2e 3/3 (this file), service-e2e 1/2 (backend)
//
// Implement target: src/components/vendor/vendor-reply.fixture.e2e.test.tsx
//
// Covers:
//   src/app/vendor/reviews/page.tsx (VendorReviewsPage)
//   src/components/vendor/vendor-review-list-item.tsx (new)
//   src/components/vendor/vendor-reply-form.tsx (new)
//   src/components/vendor/product-thumbnail.tsx (new)
//   src/hooks/useReviews.ts (useStoreProductReviews, useCreateReviewReply, useUpdateReviewReply)
//   src/lib/api/reviews.ts (createReviewReply, updateReviewReply)
//
// Harness: Vitest + RTL; mock executeMutation / react-query hooks; stub next/image.
//
// Test Boundaries compliance (Frontend Design Doc):
// Mock: GraphQL executeMutation, store product reviews query data
// No mock: VendorReplyForm local state (draftBody, inline errors)
//
// User focus journey #1: Vendor creates reply on /vendor/reviews
//
// ---------------------------------------------------------------------------
// AC-001: "WHEN vendor with reviews loads `/vendor/reviews`, each row shall display productName,
// 64×64 thumbnail (or `ไม่มีรูป` fallback), star rating, and comment or `ไม่มีความคิดเห็น`"
// AC-005: "WHEN review has no `reply`, `VendorReplyForm` shall show empty textarea and primary
// button `บันทึกคำตอบ`"
// AC-005 (submit): "WHEN vendor submits valid non-empty text ≤1000 characters, system shall call
// `createReviewReply`, invalidate store reviews query, and show brief success copy"
// AC-007: "WHEN review has `reply`, textarea prefilled and button `อัปเดตคำตอบ`"
// AC-008: "No delete control rendered"
// AC-006 / AC-011 (error paths): duplicate create or forbidden → inline error, draft preserved
// FR-8.1: char counter `n/1000`
// ROI: 69 (BV:9 × Freq:6 + Legal:0 + Defect:9)
// Behavior: multi-step admin journey — page renders review row with thumbnail + customer content →
// vendor types reply in textarea → clicks "บันทึกคำตอบ" → createReviewReply called with reviewId +
// trimmed body → query invalidation → success copy; second scenario prefilled row calls
// updateReviewReply when reply.id present; no delete button in DOM.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (VendorReviewListItem, VendorReplyForm), mocked mutations + storeProductReviews fixture
// @complexity: high
// Primary failure mode: form always calls create (never update); mutation not invalidated; success
// without API call; delete button rendered; thumbnail/empty comment regressions.
// Proof obligation: render list with one unreplied review — type "ขอบคุณที่รีวิว", submit, assert
// createReviewReply called once with { reviewId, body }, invalidateQueries on reviews.store(storeId),
// success text appears; render row with existing reply — assert textarea prefilled, submit calls
// updateReviewReply with replyId; assert queryByRole delete absent; null productImageUrl shows
// "ไม่มีรูป"; empty comment shows "ไม่มีความคิดเห็น".
// Boundary path: create vs update branch (reply?.id present vs absent).
// Verification points / expected results / pass criteria:
//   - Unreplied row: empty textarea, "บันทึกคำตอบ", counter updates on type.
//   - Submit triggers createReviewReply + cache invalidation + success message.
//   - Replied row: prefilled body, "อัปเดตคำตอบ", updateReviewReply on submit.
//   - No delete control anywhere.
//   - Thumbnail fallback and rating-only comment copy correct.
//   - Fail if wrong mutation, missing invalidation, or delete button present.
//
// ---------------------------------------------------------------------------
// AC-006: "IF mutation returns duplicate error, inline error `มีคำตอบอยู่แล้ว` and textarea preserved"
// AC-011: "IF forbidden, inline error `ไม่มีสิทธิ์ตอบรีวิวนี้`"
// ROI: 38 (BV:5 × Freq:4 + Legal:0 + Defect:8) — boundary cases in same implement file
// Behavior: mocked createReviewReply rejects with REVIEW_REPLY_ALREADY_EXISTS or STORE_ACCESS_DENIED;
// form shows Thai inline error; draft text unchanged; submit re-enabled after error.
// @category: edge-case
// @lane: fixture-e2e
// @dependency: VendorReplyForm, mocked failing mutations
// @complexity: medium
// Primary failure mode: generic error only; draft cleared on failure; optimistic success shown.
// Proof obligation: submit with mocked GraphQL error codes; assert specific Thai messages and
// textarea value equals pre-submit draft.
// Verification points / expected results / pass criteria:
//   - Duplicate: "มีคำตอบอยู่แล้ว" visible; draft preserved.
//   - Forbidden: "ไม่มีสิทธิ์ตอบรีวิวนี้" visible; draft preserved.
//   - Fail if draft cleared or wrong message.
