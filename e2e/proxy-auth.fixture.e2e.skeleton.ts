// Proxy Middleware Auth Journey [fixture-e2e RESERVED] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-00 <-> S-06 transitions; "Admin Middleware UX Change")
// Generated: 2026-07-09 | Budget Used (Admin feature): integration 3/3, fixture-e2e 3/3 (this file is the RESERVED slot, covers AC-009/010/011), service-e2e 0/2
//
// Implement target: e2e/proxy-auth.spec.ts
// Companion/precedent: e2e/auth-redirect.spec.ts (currently covers only the
// unauthenticated-request case; this skeleton extends that coverage with
// the wrong-role and authenticated-no-flash cases per ADR-0003/AD-1)
// Fixtures to add/extend: e2e/fixtures/taxonomy/admin-auth.ts
//   (authenticateAsAdmin) -- per frontend Design Doc Interface Change
//   Matrix, `authenticateAsAdmin`'s literal token must become a
//   JWT-shaped fake token carrying `role: admin` once proxy.ts ships,
//   since proxy.ts (unlike the current client AuthGuard) decodes role from
//   the cookie itself with no access to the zustand/localStorage seed. A
//   sibling `authenticateAsVendor` (role: vendor) is needed for the
//   wrong-role cases below.
//
// This is the reserved fixture-e2e slot for the Admin feature: AD-1's
// auth-gate migration is the clearest multi-step, user-facing journey in
// scope (unauthenticated -> login; authenticated wrong-role -> role
// landing page; authenticated correct-role -> protected page with no
// flash), spanning the S-00/S-06 screen transitions. Emitted regardless of
// ROI ranking per budget rules.
//
// ---------------------------------------------------------------------------
// AC-009: "WHEN a request to a protected route has no valid session, THE
// SYSTEM SHALL redirect to `/login` via middleware before sending any
// protected page markup" (PRD AD-1; UI Spec "Admin Middleware UX Change")
// ROI: 99 (BV:9 x Freq:10 + Legal:0 + Defect:9)
// Behavior: unauthenticated request to `/admin/*` or `/vendor/*` is
// redirected to `/login` by `src/proxy.ts` before any protected markup is
// sent -- same outcome as today's `AuthGuard`, but decided server-side.
// @category: core-functionality
// @lane: fixture-e2e
// @dependency: full-ui (real Next.js proxy.ts middleware, no GraphQL backend needed for the redirect decision itself), no cookies set (regression case already covered by e2e/auth-redirect.spec.ts)
// @complexity: low
// Primary failure mode: proxy.ts's matcher (`['/admin/:path*', '/vendor/:path*']`) misses a route, or the redirect happens after protected markup is already streamed, reopening the AC-009 gap AD-1 is meant to close.
// Proof obligation: navigate directly to `/admin/stores` and `/vendor`
// with no auth cookies set, and assert the browser lands on `/login`
// (URL + a login-page-only element visible) with no protected-route DOM
// ever observable (this AC is largely already proven by the existing
// e2e/auth-redirect.spec.ts; this skeleton re-states it here so the full
// AD-1 journey is documented in one place -- do not duplicate the
// assertion if the existing spec already covers the exact route).
// Verification points / expected results / pass criteria:
//   - `page.goto('/admin/stores')` and `page.goto('/vendor')` with no
//     auth cookies both resolve to `/login`.
//   - No protected-route heading/content is ever visible during the
//     navigation.
//
// ---------------------------------------------------------------------------
// AC-010: "WHEN a request to a protected route has a valid session but the
// wrong role, THE SYSTEM SHALL redirect server-side to the correct role
// landing page (`/admin/stores` for admin, `/vendor` for vendor), matching
// current `AuthGuard` role-redirect targets" (PRD AD-1; UI Spec AC-010 row)
// ROI: 56 (BV:8 x Freq:6 + Legal:0 + Defect:8)
// Behavior: a vendor-role session hitting `/admin/stores` is redirected to
// `/vendor`; an admin-role session hitting `/vendor` is redirected to
// `/admin/stores` -- decided by proxy.ts before any protected markup for
// the wrong role is sent.
// @category: core-functionality
// @lane: fixture-e2e
// @dependency: full-ui (proxy.ts, fake JWT-shaped `accessToken` cookie carrying `role: vendor` or `role: admin`), no GraphQL backend required
// @complexity: medium
// Primary failure mode: proxy.ts has no way to determine role from the
// cookie alone (unlike the client `AuthGuard`, which reads role from the
// zustand store hydrated from an authenticated API response) -- if the
// JWT payload's `role` claim isn't decoded correctly by proxy.ts, a
// wrong-role request could either wrongly pass through or redirect to the
// wrong landing page.
// Proof obligation: seed a JWT-shaped `accessToken` cookie whose decoded
// payload has `role: 'vendor'`, navigate to `/admin/stores`, and assert
// the browser lands on `/vendor`; repeat with `role: 'admin'` navigating
// to `/vendor`, asserting landing on `/admin/stores`. Assert no markup
// specific to the wrong-role protected route is ever visible.
// Verification points / expected results / pass criteria:
//   - Vendor-role cookie + `/admin/stores` request -> lands on `/vendor`.
//   - Admin-role cookie + `/vendor` request -> lands on `/admin/stores`.
//   - An unrecognized/malformed role claim falls back to `/login`,
//     matching current `AuthGuard` fallback behavior.
//   - Fail if the wrong-role request is allowed through, redirected to
//     the wrong landing page, or if wrong-role protected markup is ever
//     observable.
//
// ---------------------------------------------------------------------------
// AC-011: "WHEN an already-authenticated user navigates between protected
// routes, THE SYSTEM SHALL NOT render any visible loading state
// ('กำลังโหลด...' or equivalent) before the target page appears" (PRD AD-1;
// UI Spec AC-011 row; UI-P5)
// ROI: 77 (BV:7 x Freq:10 + Legal:0 + Defect:7)
// Behavior: an authenticated admin/vendor clicking a `DashboardShell` nav
// link between two protected routes never sees the "กำลังโหลด..." text (or
// any equivalent placeholder) that `AuthGuard`'s `hasHydrated` gate
// produces today -- the auth decision already happened at the proxy layer
// before the response was sent.
// @category: core-functionality
// @lane: fixture-e2e
// @dependency: full-ui (proxy.ts + AuthGuard retained as defense-in-depth, authenticated correct-role JWT-shaped cookie), no GraphQL backend required for the navigation/flash assertion itself
// @complexity: medium
// Primary failure mode: `AuthGuard`'s `hasHydrated` loading branch
// (`auth-guard.tsx:44`, "กำลังโหลด...") is left in place unconditionally
// instead of being removed/gated out now that proxy.ts has already
// decided, so the flash UI-P5 is meant to eliminate still renders
// transiently on every protected-to-protected navigation.
// Proof obligation: authenticate as a correct-role user (admin or
// vendor), land on one protected route, then click a `DashboardShell` nav
// link to a second protected route, and assert the "กำลังโหลด..." text (or
// any placeholder matching that copy) is never present in the DOM at any
// point during the navigation -- capture intermediate frames/DOM snapshots
// during the transition, not just the settled end state, since a
// sub-render flash can be missed by a single post-navigation assertion.
// Verification points / expected results / pass criteria:
//   - Zero occurrences of the "กำลังโหลด..." text (or equivalent
//     placeholder) in the DOM at any captured point during a protected
//     -to-protected navigation while authenticated with the correct role.
//   - The target protected page's content is the only thing rendered once
//     navigation settles.
//   - Fail if the loading text appears even transiently.
