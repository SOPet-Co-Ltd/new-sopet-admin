// Analytics Code-Split First-Visit Loading [fixture-e2e] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md ("Admin Loading Behavior - Analytics Code-Split Fallback (AD-5)"; UI-P7)
// Generated: 2026-07-09 | Budget Used (Admin feature): integration 3/3, fixture-e2e 3/3 (this file is an additional slot, ROI 21 >= 20), service-e2e 0/2
//
// Implement target: e2e/admin-analytics-code-split.spec.ts
// Covers: src/app/admin/analytics/page.tsx (BreakdownChart/SalesOverTimeChart converted to next/dynamic, loading text ~line 80)
//
// ---------------------------------------------------------------------------
// AC-016: "WHEN a staff member visits `/admin/analytics` for the first
// time in a session, THE SYSTEM SHALL load the chart module and its data
// hooks only at this point (not at login), showing the existing text-line
// loading convention while doing so" (PRD AD-5; UI Spec "Admin Loading
// Behavior - Analytics Code-Split Fallback")
// ROI: 21 (BV:5 x Freq:3 + Legal:0 + Defect:6)
// Behavior: on the very first visit to `/admin/analytics` in a session,
// the chart chunk (currently statically imported per
// `admin/analytics/page.tsx:4-5`) downloads on demand; while it downloads,
// the existing `text-muted` "กำลังโหลดข้อมูล..." line is shown (no new
// spinner/skeleton); on a second visit in the same session, charts render
// immediately since the chunk is already cached.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (analytics page route, next/dynamic-loaded chart components, mocked/intercepted GraphQL analytics queries), authenticated admin session
// @complexity: medium
// Primary failure mode: `BreakdownChart`/`SalesOverTimeChart` remain
// statically imported (no `next/dynamic` conversion), so their code ships
// in the shared bundle regardless of whether `/admin/analytics` is ever
// visited, and the "first visit only" loading moment this AC describes
// never has a chance to occur because there is no separate chunk to wait
// on.
// Proof obligation: authenticate as admin, navigate directly to a
// non-analytics protected route first (e.g. `/admin/stores`), assert via
// network/resource-timing inspection that no analytics-chart-specific JS
// chunk has been requested yet; then navigate to `/admin/analytics` for
// the first time this session and assert the existing `text-muted`
// "กำลังโหลดข้อมูล..." line appears before the charts render, and that this
// is the point at which the analytics chunk is requested; navigate away
// and back to `/admin/analytics` and assert the loading text does not
// reappear (chunk already cached) on the second visit.
// Verification points / expected results / pass criteria:
//   - No analytics-chart chunk request is observed before the first visit
//     to `/admin/analytics`.
//   - On first visit, the "กำลังโหลดข้อมูล..." text-line appears (reusing
//     the exact existing copy/style, no new visual element) until the
//     charts resolve.
//   - On a second visit within the same session, the loading text does
//     not reappear and charts render immediately.
//   - Fail if the chart chunk is present in the bundle loaded before the
//     first analytics visit, if a new visual element (spinner/skeleton)
//     is introduced instead of the existing text-line, or if the loading
//     moment recurs on the second visit.
