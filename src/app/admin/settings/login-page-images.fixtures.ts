/**
 * Phase 0 fixture-e2e stubs for Login Page Images (admin settings).
 *
 * @category e2e-setup
 * @lane fixture-e2e
 *
 * Import from Phase 4 journeys:
 *   `src/app/admin/settings/login-page-images.fixture.e2e.test.tsx`
 *   → `import { … } from './login-page-images.fixtures'`
 *
 * Skeleton annotations:
 *   `./login-page-images.fixture.e2e.skeleton.ts`
 *
 * Mock target hooks (from `@/hooks/usePlatformSettings`):
 *   useLoginPageImages / useUpdateLoginPageImages /
 *   useClearLoginPageDesktopImage / useClearLoginPageMobileImage
 *
 * Storefront UI is out of scope (ADR-0009).
 */

/** Singleton login-images payload — matches Design Doc `LoginPageImages` contract. */
export type LoginPageImagesFixture = {
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  altText: string | null;
};

/** Empty public/admin read — get-miss / after clearDesktop. */
export const emptyLoginPageImages: LoginPageImagesFixture = {
  desktopImageUrl: null,
  mobileImageUrl: null,
  altText: null,
};

/** Desktop-only CDN config (AC-009 path; mobile optional unset). */
export const desktopOnlyLoginPageImages: LoginPageImagesFixture = {
  desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
  mobileImageUrl: null,
  altText: null,
};

/** Desktop + mobile CDN (clear-mobile journey; desktop retained). */
export const desktopAndMobileLoginPageImages: LoginPageImagesFixture = {
  desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
  mobileImageUrl: 'https://cdn.example.com/login-images/mobile.webp',
  altText: null,
};

/** Fully configured singleton (save + clear-desktop cascade journeys). */
export const configuredLoginPageImages: LoginPageImagesFixture = {
  desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
  mobileImageUrl: 'https://cdn.example.com/login-images/mobile.webp',
  altText: 'SOPET login branding',
};

/** After clearLoginPageMobileImage — desktop + alt retained, mobile null. */
export const mobileClearedLoginPageImages: LoginPageImagesFixture = {
  desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
  mobileImageUrl: null,
  altText: 'SOPET login branding',
};

/** Upload folder asserted by panel/upload tests (DEFAULT_RULES). */
export const LOGIN_IMAGES_UPLOAD_FOLDER = 'login-images' as const;

/** Query hook return shape for `useLoginPageImages` (TanStack Query). */
export type UseLoginPageImagesMockResult = {
  data: LoginPageImagesFixture | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => unknown;
};

/** Mutation hook return shape for update / clear* hooks. */
export type LoginPageImagesMutationMockResult = {
  mutateAsync: (...args: unknown[]) => Promise<LoginPageImagesFixture>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

export function createUseLoginPageImagesMockResult(
  overrides?: Partial<UseLoginPageImagesMockResult>,
): UseLoginPageImagesMockResult {
  return {
    data: overrides?.data ?? emptyLoginPageImages,
    isLoading: overrides?.isLoading ?? false,
    error: overrides?.error ?? null,
    refetch: overrides?.refetch ?? (() => undefined),
  };
}

export function createLoginPageImagesMutationMockResult(
  overrides?: Partial<LoginPageImagesMutationMockResult>,
): LoginPageImagesMutationMockResult {
  return {
    mutateAsync: overrides?.mutateAsync ?? (async () => emptyLoginPageImages),
    isPending: overrides?.isPending ?? false,
    isError: overrides?.isError ?? false,
    error: overrides?.error ?? null,
    reset: overrides?.reset ?? (() => undefined),
  };
}

/**
 * Documented Phase 4 mock wiring (vi.mock('@/hooks/usePlatformSettings')).
 * Hook names must match skeleton / Design Doc § Data Flow.
 */
export const loginPageImagesHookNames = [
  'useLoginPageImages',
  'useUpdateLoginPageImages',
  'useClearLoginPageDesktopImage',
  'useClearLoginPageMobileImage',
] as const;

export type LoginPageImagesHookName = (typeof loginPageImagesHookNames)[number];

/** Phase 4 implement target path (relative to this directory). */
export const LOGIN_PAGE_IMAGES_FIXTURE_E2E_TEST_PATH =
  './login-page-images.fixture.e2e.test.tsx' as const;
