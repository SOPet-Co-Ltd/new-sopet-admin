// Admin Search Synonyms [fixture-e2e] Test Skeleton - Design Doc: smart-search-frontend-design.md
// UI Spec: smart-search-ui-spec.md (S-03 AdminSearchSynonymsPage, AC-011–012)
// Generated: 2026-07-10 | Budget Used (Smart Search feature): NOT EMITTED — fixture-e2e 3/3 allocated to storefront journeys (ROI 68 < navbar 109 / hydration 86 / recovery 72)
//
// Implement target: e2e/smart-search-admin.fixture.e2e.spec.ts
// Deferred candidate for manual promotion if admin E2E budget expanded separately.
//
// ---------------------------------------------------------------------------
// AC-011: "WHEN an admin saves a valid synonym, THE SYSTEM SHALL persist via GraphQL and
// refresh the table"
// AC-012: "WHEN a non-admin accesses `/admin/search/*`, THE SYSTEM SHALL deny access"
// ROI: 68 (BV:8 × Freq:6 + Legal:0 + Defect:8)
// Behavior: admin navigates /admin/search/synonyms → create dialog → save → table row appears;
// non-admin fixture receives redirect/denied.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked admin search GraphQL), Playwright, AuthGuard
// @complexity: medium
// Primary failure mode: table not invalidated after mutation, dialog validation bypass, guard missing.
// Proof obligation: Playwright with admin auth stub; fill synonym form; intercept createSearchSynonym;
// assert table refresh; repeat as vendor role → access denied.
// Verification points / expected results / pass criteria:
//   - Saved synonym row visible with term, expansion, status.
//   - Non-admin cannot view page content.
//   - Fail if list stale or guard absent.
