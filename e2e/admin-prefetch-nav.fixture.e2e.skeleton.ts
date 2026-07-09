// DashboardShell Nav Hover-Prefetch Journey [fixture-e2e] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (Component: DashboardShell Navigation Links; AC-015)
// Generated: 2026-07-09 | Budget Used (Admin feature): integration 3/3, fixture-e2e 3/3 (this file is an additional slot, ROI 48 >= 20), service-e2e 0/2
//
// Implement target: e2e/admin-prefetch-nav.spec.ts
// Covers: src/components/dashboard-shell.tsx (nav Link items, lines ~66-88, extended with onMouseEnter/onFocus prefetchQuery)
//         -> TanStack Query `queryClient.prefetchQuery` using query keys from src/lib/react-query/keys.ts
//
// ---------------------------------------------------------------------------
// AC-015: "WHEN staff hovers or focuses a primary `DashboardShell` nav
// link, THE SYSTEM SHALL call `prefetchQuery` for that section's primary
// list query, with no visible change to the nav link; if resolved before
// click, the destination renders with no loading state" (PRD AD-4; UI Spec
// "Component: DashboardShell Navigation Links")
// ROI: 48 (BV:6 x Freq:7 + Legal:0 + Defect:6)
// Behavior: staff hovers/focuses a nav link (e.g. "Stores") before
// clicking it; `prefetchQuery` fires for that section's primary list
// query; on click, the destination page renders its data immediately with
// no "กำลังโหลด..." text, because TanStack Query already resolved the
// prefetch before navigation completed.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (DashboardShell nav links, prefetchQuery, real network request to a mocked/intercepted GraphQL endpoint via page.route), authenticated admin session
// @complexity: medium
// Primary failure mode: the nav link's hover/focus handler is added but
// calls `prefetchQuery` with a query key that doesn't match the
// destination page's own `useQuery` key (per src/lib/react-query/keys.ts),
// so the prefetch populates a cache entry the destination never reads,
// and the "กำลังโหลด..." text still appears after the click.
// Proof obligation: authenticate as admin, intercept the GraphQL endpoint
// to control response timing/content, hover/focus a primary nav link
// (e.g. "Stores") and hold long enough for the prefetch to resolve, assert
// no new visible DOM/style change appears on the link itself, then click
// it and assert the destination page's list renders immediately with the
// "กำลังโหลด..." text never appearing, and that only one network call was
// made for that list query across the whole hover+click sequence.
// Verification points / expected results / pass criteria:
//   - Hovering/focusing the nav link produces zero DOM/class/style change
//     on the link (UI-P4 no-visible-affordance guard).
//   - Exactly one network call is recorded for the destination's primary
//     list query across the hover-then-click sequence (the prefetch call;
//     no duplicate call after navigation).
//   - The destination page never shows its "กำลังโหลด..." loading text
//     when the prefetch has resolved before the click.
//   - Fail if a duplicate network call is observed after navigation, if
//     the loading text appears despite a resolved prefetch, or if hovering
//     changes the link's appearance.
