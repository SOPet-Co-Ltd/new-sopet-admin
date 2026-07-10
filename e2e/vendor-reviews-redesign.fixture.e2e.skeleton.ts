// Vendor Reviews Page Redesign — fixture-e2e Test Skeleton - Design Doc: vendor-reviews-redesign-frontend-design.md
// UI Spec: vendor-reviews-redesign-ui-spec.md
// Generated: 2026-07-10 | Budget Used: integration 3/3 (see src/app/vendor/reviews/vendor-reviews-redesign.int.test.skeleton.tsx), fixture-e2e 3/3, service-e2e 0/2
//
// Implement target: e2e/vendor-reviews-redesign.fixture.e2e.spec.ts
//
// Harness: Playwright + vendor auth cookie (reuse e2e/fixtures/taxonomy/admin-auth authenticateAsVendor pattern) + GraphQL route interception for storeReviewSummary + storeProductReviews + createReviewReply (no live backend).
// Test Boundaries: mock GraphQL network only; real browser layout, Select interactions, collapse toggles, and form submit flow.
//
// Supersedes prior journey scope in src/components/vendor/vendor-reply.fixture.e2e.test.skeleton.tsx for collapsed-by-default reply UX and new summary/filter sections.
//
// ---------------------------------------------------------------------------
// Journey (reserved slot): S-01 multi-step — load reviews → filter unreplied → expand reply → create → collapsed preview (AC-003, AC-007, AC-008, AC-009)
// UI Spec transitions: SUMMARY → FILTERED → EXPAND → save success → PREVIEW
// ROI: 89 (BV:10 × Freq:8 + Legal:0 + Defect:9) — reserved user-facing multi-step journey
// Behavior: vendor navigates /vendor/reviews with fixture storeId → summary + breakdown + collapsed review cards visible → select reply filter "ยังไม่ตอบ" → list narrows without network refetch → click "ตอบกลับ" on target card → VendorReplyForm expands (aria-expanded true) → type valid reply → "บันทึกคำตอบ" → intercept createReviewReply → success → section collapses to preview with "ตอบแล้ว" badge and truncated shop reply; assert no delete control.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend), VendorReviewsPage, Playwright, vendor auth fixture
// @complexity: high
// Primary failure mode: reply form visible on load without expand click; filter triggers live API refetch; save leaves form expanded; preview missing after success; createReviewReply not called with expected variables.
// Proof obligation: stub summary + reviews fixtures with ≥1 unreplied review; complete browser Select change on #reviews-reply-filter; expand via "ตอบกลับ" before typing; assert GraphQL operation name/variables for createReviewReply; after success assert collapsed preview text and badge "ตอบแล้ว", textarea not visible until re-expand. Boundary path: collapsed-default → expand → submit → preview collapse (main regression vs always-expanded legacy UI).
// Verification points / expected results / pass criteria:
//   - Page loads summary stats, "รีวิวตามสินค้า" breakdown, and collapsed reply buttons (not forms).
//   - Filter "ยังไม่ตอบ" updates visible cards only (client-side).
//   - Expand → form label "ตอบกลับรีวิว" visible; submit enabled with non-empty text.
//   - createReviewReply intercepted once with reviewId + body.
//   - Post-save: preview variant visible, form hidden, badge "ตอบแล้ว".
//   - No delete button anywhere on page.
//   - Fail if form shown without expand, wrong mutation payload, or expanded form after save.
//
// ---------------------------------------------------------------------------
// AC-001: "When summary data loads, render average (1 decimal), StarRating, review count, distribution bars 5→1"
// AC-002: "When productBreakdown has items, render ranked list — no product links"
// AC-012: "While summary or reviews are loading, show pulse skeleton placeholders — not plain text only"
// AC-006: "Each review renders as single Card with reply-status badge"
// Golden state #1 (UI Spec Visual Acceptance)
// ROI: 72 (BV:8 × Freq:8 + Legal:0 + Defect:8)
// Behavior: fixture delayed responses → navigate /vendor/reviews → assert pulse skeletons in summary and list areas (no bare "กำลังโหลด..." only) → after load assert average rating one decimal, review count, distribution aria-label "การกระจายคะแนนรีวิว", breakdown header "รีวิวตามสินค้า", review cards with badges "ตอบแล้ว"/"ยังไม่ตอบ", all reply sections collapsed.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend with controllable latency), Playwright
// @complexity: medium
// Primary failure mode: plain-text loading copy returns; productBreakdown missing; double-border list wrapper returns; distribution chart absent; all reply forms expanded on load.
// Proof obligation: delay GraphQL fixtures to observe skeleton phase first; after settle assert golden loaded layout per UI Spec §Visual Acceptance #1 — summary hierarchy, breakdown rows without links, single Card per review, collapsed replies. Boundary path: loading → ready transition (skeleton must appear before content).
// Verification points / expected results / pass criteria:
//   - During load: animate-pulse skeleton blocks visible in summary and list regions.
//   - After load: average + count + distribution bars present.
//   - Breakdown lists products as plain text (no `<a href`).
//   - Reply badges visible; reply forms not visible until user expands.
//   - Fail if loading is text-only or breakdown/summary missing after fixture resolves.
//
// ---------------------------------------------------------------------------
// AC-003: "When reply-status filter is 'ยังไม่ตอบ' …"
// AC-004: "When rating filter is e.g. '5 ดาว' …"
// AC-005: "When both filters active, apply AND logic"
// AC-013: "When filters exclude all reviews, list empty state: 'ไม่พบรีวิวที่ตรงกับตัวกรอง'"
// Golden state #4 (UI Spec Visual Acceptance)
// ROI: 48 (BV:6 × Freq:7 + Legal:0 + Defect:6)
// Behavior: load page with fixture reviews spanning reply statuses and ratings → select "ยังไม่ตอบ" + "5 ดาว" → only matching cards remain → adjust to combination with zero matches → "ไม่พบรีวิวที่ตรงกับตัวกรอง" shown (distinct from "ยังไม่มีรีวิว").
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked storeProductReviews fixture), Playwright
// @complexity: medium
// Primary failure mode: filters ignored in browser; OR logic; wrong empty-state copy when filtered vs truly empty catalog.
// Proof obligation: fixture encodes at least one 5-star unreplied and one 5-star replied review; drive both Select controls in PageHeader action area; assert DOM card count and product name visibility; then select filters excluding all fixture rows and assert filter-specific empty copy. Boundary path: filtered-empty vs unfiltered-empty message distinction.
// Verification points / expected results / pass criteria:
//   - Combined filters show intersection only.
//   - Filter change does not reload page or refetch (optional: assert single GraphQL reviews query).
//   - Zero-match shows "ไม่พบรีวิวที่ตรงกับตัวกรอง".
//   - Unfiltered zero-review fixture (separate setup) would show "ยังไม่มีรีวิว" — not conflated.
//   - Fail if all reviews remain visible or wrong empty message.
