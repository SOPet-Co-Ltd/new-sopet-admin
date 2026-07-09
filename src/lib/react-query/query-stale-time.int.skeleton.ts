// Per-Query staleTime Tuning [integration] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// Generated: 2026-07-09 | Budget Used (Admin feature): integration 3/3 (this file contributes 1), fixture-e2e 3/3, service-e2e 0/2
//
// Implement target: src/lib/react-query/query-stale-time.int.test.ts
// Covers: src/hooks/useTaxonomy.ts, src/hooks/useMyStores.ts / useStoreSettings.ts,
//         src/hooks/useVendorOrders.ts -- each currently relying solely on the
//         single global `staleTime: 60 * 1000` in src/lib/react-query/provider.tsx:24
//         (per PRD AD-3 table: taxonomy 5min, store settings/my stores 2min,
//         vendor orders 0)
//
// ---------------------------------------------------------------------------
// AC-014: "At least the taxonomy, store settings, and order-list queries
// each have an explicit `staleTime` distinct from the prior single global
// default, with an inline comment stating the volatility rationale
// (reviewed in code review)" (PRD AD-3)
// ROI: 30 (BV:5 x Freq:5 + Legal:0 + Defect:5)
// Behavior: `useTaxonomy`'s list query configures `staleTime: 5 * 60_000`;
// `useStoreSettings`/`useMyStores` configure `staleTime: 2 * 60_000`;
// `useVendorOrders` configures `staleTime: 0` -- each distinct from the
// 60_000ms global fallback, so data that changes rarely (taxonomy) is
// reused longer without a network refetch, and data that changes
// frequently (order status) always refetches.
// @category: core-functionality
// @lane: integration
// @dependency: useTaxonomy, useStoreSettings/useMyStores, useVendorOrders (real hooks), test QueryClient (real, mocked queryFn network layer)
// @complexity: medium
// Primary failure mode: AD-3 is implemented by changing the global
// default in `provider.tsx` instead of adding per-hook overrides, so every
// query in the app shares one new staleTime value again -- satisfying
// none of AC-014's "at least these three queries have a *distinct*,
// intentional value" requirement, and reintroducing the same
// over-refetching (or under-refetching) problem for whichever domain
// wasn't the one the global value was tuned for.
// Proof obligation: for each of the three named hooks, mount the hook
// against a test `QueryClient` with a mocked `queryFn`, read back the
// resolved query's effective `staleTime` (or exercise it behaviorally: a
// second render/remount within the tuned window does not trigger a second
// `queryFn` call, while a remount just past the window does), and assert
// each hook's value differs from the 60_000ms global default and matches
// its documented volatility tier (taxonomy longest, vendor orders
// shortest/none).
// Verification points / expected results / pass criteria:
//   - `useTaxonomy`'s primary list query's configured `staleTime` is
//     greater than the 60_000ms global default (documented rationale:
//     rarely changes).
//   - `useStoreSettings`/`useMyStores`'s query `staleTime` is distinct
//     from the global default (documented rationale: occasional edits).
//   - `useVendorOrders`'s query `staleTime` is `0` (documented rationale:
//     status changes frequently) -- i.e. strictly shorter than the global
//     default, not merely different.
//   - Fail if any of the three hooks still resolves to the bare
//     60_000ms global default, or if `useVendorOrders` has a non-zero
//     staleTime that permits serving stale order-status data from cache.
