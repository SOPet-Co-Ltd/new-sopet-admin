// Login Page Images fixture-e2e Test — Admin /admin/settings Login images tab
// Design Doc: login-page-images-admin-design.md
// Backend Design Doc: login-page-images-backend-design.md (API contracts)
// UI Spec: login-page-images-ui-spec.md | PRD: login-page-images-prd.md
// Implement target: src/app/admin/settings/login-page-images.fixture.e2e.test.tsx
// Parent patterns: src/app/admin/settings/page.test.tsx (tab chrome mocks);
//   src/components/vendor/vendor-reply.fixture.e2e.test.tsx (RTL fixture-e2e lane)
// Generated: 2026-07-22 | Budget Used: integration 3/3 (sopet-backend), fixture-e2e 3/3,
// service-e2e 0/2
//
// Lane: Vitest + RTL + mocked login-images hooks (Design Doc / scope — not Playwright).
// Storefront: OUT OF SCOPE.
//
// ---------------------------------------------------------------------------
// Phase 0 fixture / mock stubs (import paths for later journey implementation)
// @category: e2e-setup
// @lane: fixture-e2e
// ---------------------------------------------------------------------------
// Implement target: ./login-page-images.fixture.e2e.test.tsx
// Fixture module: ./login-page-images.fixtures.ts
//   emptyLoginPageImages | desktopOnlyLoginPageImages |
//   desktopAndMobileLoginPageImages | configuredLoginPageImages |
//   mobileClearedLoginPageImages
//   createUseLoginPageImagesMockResult / createLoginPageImagesMutationMockResult
//   LOGIN_IMAGES_UPLOAD_FOLDER = 'login-images'
// Page chrome: AdminPlatformSettingsPage from ./page
// Panel: LoginImagesPanel from ./login-images-panel (new)
// Hooks (mock): @/hooks/usePlatformSettings —
//   useLoginPageImages / useUpdateLoginPageImages /
//   useClearLoginPageDesktopImage / useClearLoginPageMobileImage
// Shared UI: ImageUploadField (optional onClear), ConfirmDeleteDialog (dialogDescription)
// Fixtures: { desktopImageUrl, mobileImageUrl, altText } nulls or CDN URLs
// Upload folder: login-images (DEFAULT_RULES) — assert folder prop when testing upload
// Auth: AuthGuard already gates /admin/* — AC-017 covered by existing layout; do not retest
//
// Test Boundaries compliance (Admin Design Doc § Test Boundaries):
// Mock: GraphQL / usePlatformSettings login hooks
// Mock: ImageUploadField in page chrome tests (existing pattern)
// @real-dependency: ConfirmDeleteDialog phrase gating (or panel with real dialog) for AC-020
// Mock: Real object storage / MinIO
//
// Dedup: No existing loginPageImages / Login images tests (grep clean).
// page.test.tsx will gain unit chrome assertions; this lane owns multi-step journeys.
//
// ---------------------------------------------------------------------------
// fixture-e2e test 1 of 3 — RESERVED journey: Tab → Save desktop → Clear desktop confirm → Empty
// ---------------------------------------------------------------------------
//
// Journey AC: "Platform admin opens /admin/settings → selects รูปหน้าเข้าสู่ระบบ →
// form loads → sets desktop (optional mobile/alt) → Save → success → Clear desktop →
// confirm dialog with phrase ล้างรูป → confirm → immediate clearLoginPageDesktopImage →
// form fully empty + success; cancel leaves unchanged (AC-014, AC-015, AC-013, AC-020,
// AC-001/009 via mocked save)"
// Screen transition: S-01 (settings) → S-01 Login panel → S-02 ClearDesktopConfirmDialog →
// S-01 empty (Saved)
// ROI: 89 (BV:10 × Freq:8 + Legal:0 + Defect:9)
// Behavior: Tab present + header เพิ่ม* hidden → dirty Save calls updateLoginPageImages with
// desktopImageUrl → success บันทึกการตั้งค่าแล้ว → clear desktop opens dialog with clear
// cascade copy (not generic-delete การลบ "{confirmLabel}" ไม่สามารถย้อนกลับได้) → confirm
// disabled until exact ล้างรูป → confirm fires clearLoginPageDesktopImage → form null/empty
// desktop+mobile+alt without separate Save
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — RTL + mocked login-images hooks;
// LoginImagesPanel; ConfirmDeleteDialog
// @complexity: high
// Primary failure mode: clear treated as dirty Save; dialog shows generic-delete copy;
// confirm enabled without phrase; clear does not empty mobile/alt; header create still shown
// on loginImages tab
// Proof obligation: Mock useLoginPageImages empty then configured; mock update + clearDesktop
// mutations; render settings page or panel; assert tab รูปหน้าเข้าสู่ระบบ; select tab →
// no เพิ่ม* header action; set desktop URL (fixture) → Save → updateLoginPageImages called
// with desktopImageUrl; success feedback; click desktop ล้างรูป → dialog title
// ล้างรูปเดสก์ท็อป? + cascade description; confirm disabled until input ล้างรูป;
// Boundary: cancel/dismiss → values unchanged, clearDesktop not called; confirm →
// clearLoginPageDesktopImage called, form empty, success feedback, no Save required.
// Fixture-only hooks — no live GraphQL.
// Verification points / expected results / pass criteria:
// - Tab labeled รูปหน้าเข้าสู่ระบบ present with banners/sponsors/ads (AC-014)
// - Header create (เพิ่ม*) hidden when loginImages selected
// - Save with desktop → updateLoginPageImages; success บันทึกการตั้งค่าแล้ว (AC-015)
// - Clear desktop → S-02; copy is clear/cascade not การลบ … ไม่สามารถย้อนกลับได้ (AC-020)
// - Confirm disabled until exact ล้างรูป; cancel leaves desktop+mobile unchanged
// - Confirm → clearLoginPageDesktopImage; form fully empty (desktop+mobile+alt); success
// - No separate Save required after clear (immediate persist UX)
//
// ---------------------------------------------------------------------------
// fixture-e2e test 2 of 3 — Desktop required blocks Save (AC-008 / AC-016 / TBD-03)
// ---------------------------------------------------------------------------
//
// AC-008 / AC-016: "If desktop is missing (not retained) and Save is attempted, then the UI
// blocks commit and shows exact error ต้องมีรูปเดสก์ท็อป"
// ROI: 71 (BV:9 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Empty/missing desktop (mobile and/or alt may be dirty) → Save → no
// updateLoginPageImages call; inline/alert shows exact ต้องมีรูปเดสก์ท็อป
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — LoginImagesPanel + loginImagesFormSchema
// @complexity: medium
// Primary failure mode: Save commits without desktop; wrong/missing Thai error string;
// partial invalid state sent to mutation
// Proof obligation: Render panel with empty desktopImageUrl; optionally set mobile/alt only;
// click บันทึก → assert update mutation NOT called; assert text ต้องมีรูปเดสก์ท็อป visible
// (role=alert or field error). Boundary: with retained desktop + mobile-only dirty → Save
// succeeds (AC-010) may be asserted in same file as secondary check or left to panel unit.
// Mock hooks only.
// Verification points / expected results / pass criteria:
// - Save without desktop → mutation not invoked
// - Exact error string ต้องมีรูปเดสก์ท็อป shown (TBD-03 locked)
// - Prior field values retained (no wipe on validation fail)
//
// ---------------------------------------------------------------------------
// fixture-e2e test 3 of 3 — Clear mobile immediate (no confirm) retains desktop
// ---------------------------------------------------------------------------
//
// AC-012: "When mobile is set and admin clicks ล้างรูป on mobile, then
// clearLoginPageMobileImage runs immediately; desktop unchanged; success feedback"
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Configured desktop+mobile → mobile ล้างรูป → clearLoginPageMobileImage called
// immediately (no S-02); desktop preview retained; success; form clean for that clear
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — LoginImagesPanel + clear mobile hook
// @complexity: medium
// Primary failure mode: mobile clear opens confirm dialog; or calls updateLoginPageImages
// with nulls instead of clearLoginPageMobileImage; or also clears desktop
// Proof obligation: Fixture configured desktop+mobile; click mobile ล้างรูป →
// clearLoginPageMobileImage called once; clearLoginPageDesktopImage NOT called;
// ConfirmDeleteDialog NOT opened; desktop URL still displayed; success feedback.
// Mock hooks only.
// Verification points / expected results / pass criteria:
// - Mobile clear → clearLoginPageMobileImage immediate (no dialog)
// - Desktop field/preview unchanged
// - Success feedback shown; no Save required for clear
// - clearLoginPageDesktopImage not invoked
//
// Skeleton only — no executable describe/it until implementation task.
// Vitest include is src/**/*.{test,spec}.{ts,tsx}; this .skeleton.ts is intentionally excluded.
