// Cache-Aware executeQuery [integration] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// Generated: 2026-07-09 | Budget Used (Admin feature): integration 3/3 (this file contributes 2), fixture-e2e 3/3, service-e2e 0/2
//
// Implement target: src/lib/graphql/client.int.test.ts
// Covers: src/lib/graphql/client.ts executeQuery (currently unconditional
// `fetchPolicy: 'network-only'` at line ~151) -> AD-2's
// `ExecuteQueryOptions.fetchPolicy` (default 'cache-first', explicit
// 'network-only' opt-in)
//
// ---------------------------------------------------------------------------
// AC-012: "Repeating the same query+variables within a defined freshness
// window (e.g., same navigation session, no intervening mutation) does not
// issue a duplicate network request, verified by network call count"
// (PRD AD-2)
// ROI: 55 (BV:6 x Freq:8 + Legal:0 + Defect:7)
// Behavior: calling `executeQuery(doc, vars)` twice in a row with
// identical `doc`+`vars` and no intervening mutation/cache eviction
// results in exactly one network call; the InMemoryCache (constructed in
// `client.ts`, currently written-to but never read) is read on the second
// call.
// @category: core-functionality
// @lane: integration
// @dependency: executeQuery, ApolloClient InMemoryCache (real cache, mocked HttpLink/MockedProvider network layer)
// @complexity: medium
// Primary failure mode: `executeQuery`'s default `fetchPolicy` remains
// `'network-only'` (or the new default policy is wired but not actually
// read from the cache first), so every call -- even for identical
// query+variables with a warm cache -- still issues a network request.
// Proof obligation: install a mocked network layer (e.g. `MockedProvider`/
// mocked `HttpLink`) configured to fail the test if invoked more than
// once for a given query+variables pair, call `executeQuery(doc, vars)`
// twice in sequence with identical arguments and no mutation in between,
// and assert the mock records exactly one network call while both calls
// resolve to equivalent data (the second served from cache).
// Verification points / expected results / pass criteria:
//   - Exactly one network call recorded for two `executeQuery` invocations
//     with identical `doc`+`vars`.
//   - Both invocations resolve with equivalent data.
//   - Fail if a second network call is recorded, or if the second call's
//     data differs from the first (indicating the cache wasn't actually
//     read).
//
// ---------------------------------------------------------------------------
// AC-013: "Callers that require guaranteed freshness (e.g., post-mutation
// confirmation reads) can still explicitly request `network-only` and
// receive it" (PRD AD-2)
// ROI: 36 (BV:6 x Freq:5 + Legal:0 + Defect:6)
// Behavior: a caller passes `{ fetchPolicy: 'network-only' }` as the third
// argument to `executeQuery`; the call issues a fresh network request even
// though an identical-query+variables cache entry already exists from a
// prior call.
// @category: core-functionality
// @lane: integration
// @dependency: executeQuery (ExecuteQueryOptions.fetchPolicy param), ApolloClient InMemoryCache (real cache, mocked network layer with two distinct response fixtures)
// @complexity: low
// Primary failure mode: the optional `options` parameter is added to
// `executeQuery`'s type signature but not actually threaded through to
// the underlying `client.query({ fetchPolicy })` call, so an explicit
// `'network-only'` request is silently served from cache instead of
// hitting the network -- this is the specific regression AD-2's reliability
// NFR ("cache-policy changes must not show stale data after a mutation")
// is guarding against.
// Proof obligation: warm the cache with one `executeQuery(doc, vars)` call
// returning fixture A, configure the mocked network layer to return a
// different fixture B for the next call, then call
// `executeQuery(doc, vars, { fetchPolicy: 'network-only' })` and assert
// (a) the mock records a second network call and (b) the returned data
// matches fixture B (the fresh network response), not the stale cached
// fixture A.
// Verification points / expected results / pass criteria:
//   - A second network call is recorded when `fetchPolicy: 'network-only'`
//     is explicitly requested, despite a matching cache entry existing.
//   - The returned data reflects the fresh network response (fixture B),
//     not the stale cached value (fixture A).
//   - Fail if the explicit `network-only` call is served from cache
//     (fixture A returned, or zero additional network calls recorded).
