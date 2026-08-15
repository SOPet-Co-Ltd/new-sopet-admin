/**
 * Phase 0 fixture-e2e stubs for Store Commission (admin store detail + payouts).
 *
 * @category e2e-setup
 * @lane fixture-e2e
 *
 * Import from Phase 1+ journeys:
 *   `src/app/admin/stores/[id]/store-commission.int.test.tsx`
 *   `src/app/admin/stores/[id]/store-commission.fixture.e2e.test.tsx`
 *   → `import { … } from './store-commission.fixtures'`
 *
 * Skeleton annotations:
 *   `./store-commission.int.skeleton.ts`
 *   `./store-commission.fixture.e2e.skeleton.ts`
 *
 * Mock target hooks (page-test boundary):
 *   `@/hooks/useAdminStores` — useAdminStore / useUpdateStoreAsAdmin
 *   `@/hooks/usePayouts` — useAdminStorePayoutSummary / useAdminStorePayouts /
 *     useTriggerPayout / useSettleManualPayout / useRejectManualPayout /
 *     useStorePayoutSummary / useStorePayouts / usePendingManualPayouts
 *
 * @real-dependency: formatCurrency (th-TH / THB — do not mock in later tests)
 *
 * Local fixture types: planned `commissionRate` / fours are not on `src/types`
 * yet. Do not import not-yet-existing UI modules.
 */

import type { AdminStore, Paginated, Payout, PayoutRailSummary, PayoutSummary } from '@/types';

/** Skeleton Arrange fours — FE-INT-1 / FIX-1. Do not invent replacements. */
export const MIXED_CUTOFF_FOURS = {
  productSold: 1400,
  shippingFees: 80,
  commissionAmount: 70,
  net: 1410,
} as const;

export type MixedCutoffFours = typeof MIXED_CUTOFF_FOURS;

/** Planned additive store field (`AdminStore.commissionRate: number | null`). */
export type AdminStoreCommissionFixture = AdminStore & {
  commissionRate: number | null;
};

/** Planned additive payout snapshot fields. `net` binds to `amount`, not `netAmount`. */
export type PayoutCommissionFixture = Payout & {
  productSold: number | null;
  shippingFees: number | null;
  commissionAmount: number | null;
  commissionRate: number | null;
};

export type AdminManualPayoutCommissionFixture = PayoutCommissionFixture & {
  storeName: string;
  bankName: string | null;
  bankCode: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
};

/** Planned additive rail money threes + rate metadata (never a money row). */
export type PayoutRailCommissionFixture = PayoutRailSummary & {
  productSold: number | null;
  shippingFees: number | null;
  commissionAmount: number | null;
  commissionRate: number | null;
};

export type PayoutSummaryCommissionFixture = Omit<PayoutSummary, 'omise' | 'manual'> & {
  productSold: number | null;
  shippingFees: number | null;
  commissionAmount: number | null;
  commissionRate: number | null;
  omise: PayoutRailCommissionFixture;
  manual: PayoutRailCommissionFixture;
};

const BASE_ADMIN_STORE = {
  id: 'store-1',
  name: 'SOPet Pet Shop',
  slug: 'sopet-pet-shop',
  description: 'Test store',
  status: 'pending',
  contactPhone: '0812345678',
  contactEmail: 'shop@example.com',
  address: 'Bangkok',
  ownerId: 'vendor-1',
  ownerEmail: 'vendor@sopet.org',
  ownerFullName: 'Vendor SOPet',
  createdAt: '2026-01-01T00:00:00.000Z',
} as const satisfies Omit<AdminStoreCommissionFixture, 'commissionRate'>;

function createAdminStoreFixture(
  commissionRate: number | null,
  overrides?: Partial<AdminStoreCommissionFixture>,
): AdminStoreCommissionFixture {
  return {
    ...BASE_ADMIN_STORE,
    commissionRate,
    ...overrides,
  };
}

function createRailFixture(
  rate: number | null,
  overrides?: Partial<PayoutRailCommissionFixture>,
): PayoutRailCommissionFixture {
  return {
    grossRevenue: MIXED_CUTOFF_FOURS.productSold,
    totalPaidOut: 0,
    availableBalance: MIXED_CUTOFF_FOURS.net,
    pendingPayoutAmount: 0,
    canRequestPayout: true,
    productSold: MIXED_CUTOFF_FOURS.productSold,
    shippingFees: MIXED_CUTOFF_FOURS.shippingFees,
    commissionAmount: MIXED_CUTOFF_FOURS.commissionAmount,
    commissionRate: rate,
    ...overrides,
  };
}

function createPayoutFixture(
  id: string,
  rate: number | null,
  overrides?: Partial<PayoutCommissionFixture>,
): PayoutCommissionFixture {
  return {
    id,
    storeId: BASE_ADMIN_STORE.id,
    amount: MIXED_CUTOFF_FOURS.net,
    netAmount: MIXED_CUTOFF_FOURS.net,
    status: 'completed',
    settlementRail: 'omise',
    createdAt: '2026-01-15T00:00:00.000Z',
    productSold: MIXED_CUTOFF_FOURS.productSold,
    shippingFees: MIXED_CUTOFF_FOURS.shippingFees,
    commissionAmount: MIXED_CUTOFF_FOURS.commissionAmount,
    commissionRate: rate,
    ...overrides,
  };
}

/** FE-INT-2 / FIX-3 — API null → field shows 7 + hint.default only. */
export const nullRateStore: AdminStoreCommissionFixture = createAdminStoreFixture(null);

/** FE-INT-2 — saved custom 0 → field shows 0 + hint.custom only. */
export const customZeroRateStore: AdminStoreCommissionFixture = createAdminStoreFixture(0);

/** FE-INT-2 / FIX-3 — saved custom 5. */
export const customFiveRateStore: AdminStoreCommissionFixture = createAdminStoreFixture(5);

/** FE-INT-3 / FIX-2 — live store rate 10% (must not overwrite snapshot 7% fours). */
export const liveTenPercentStore: AdminStoreCommissionFixture = createAdminStoreFixture(10, {
  status: 'approved',
});

/** Shared mixed-cutoff fours object for Arrange blocks. */
export const mixedCutoffFours: MixedCutoffFours = MIXED_CUTOFF_FOURS;

/** Available-balance / rail summary bound to mixed-cutoff net 1410. */
export const mixedCutoffAvailableSummary: PayoutSummaryCommissionFixture = {
  storeId: BASE_ADMIN_STORE.id,
  grossRevenue: MIXED_CUTOFF_FOURS.productSold,
  totalPaidOut: 0,
  availableBalance: MIXED_CUTOFF_FOURS.net,
  pendingPayoutAmount: 0,
  minimumPayoutAmount: 100,
  canRequestPayout: true,
  productSold: MIXED_CUTOFF_FOURS.productSold,
  shippingFees: MIXED_CUTOFF_FOURS.shippingFees,
  commissionAmount: MIXED_CUTOFF_FOURS.commissionAmount,
  commissionRate: null,
  omise: createRailFixture(null),
  manual: createRailFixture(null, { canRequestPayout: false, availableBalance: 0 }),
};

/** FIX-1 — unpaid mixed-cutoff fours plus a pending manual queue amount. */
export const mixedCutoffAvailableWithPendingSummary: PayoutSummaryCommissionFixture = {
  ...mixedCutoffAvailableSummary,
  pendingPayoutAmount: MIXED_CUTOFF_FOURS.net,
  canRequestPayout: false,
  omise: createRailFixture(null, { canRequestPayout: false, availableBalance: 0 }),
  manual: createRailFixture(null, {
    availableBalance: MIXED_CUTOFF_FOURS.net,
    pendingPayoutAmount: MIXED_CUTOFF_FOURS.net,
    canRequestPayout: false,
  }),
};

/** Live 10% available-balance (rate metadata only — fours stay server-provided). */
export const liveTenPercentAvailableSummary: PayoutSummaryCommissionFixture = {
  ...mixedCutoffAvailableSummary,
  commissionRate: 10,
  omise: createRailFixture(10),
  manual: createRailFixture(10, { canRequestPayout: false, availableBalance: 0 }),
};

/** FIX-1 — pending manual snapshot with mixed-cutoff fours. */
export const pendingManualSnapshotPayout: AdminManualPayoutCommissionFixture = {
  ...createPayoutFixture('payout-pending-manual', 7, {
    status: 'pending',
    settlementRail: 'manual',
    createdAt: '2026-02-01T00:00:00.000Z',
  }),
  storeName: BASE_ADMIN_STORE.name,
  bankName: 'Kasikornbank',
  bankCode: '004',
  bankAccountName: 'SOPet Pet Shop',
  bankAccountNumber: '1234567890',
};

/** FE-INT-3 / FIX-2 — snapshotted 7% fours (same mixed-cutoff literals). */
export const snapshotSevenPercentPayout: PayoutCommissionFixture = createPayoutFixture(
  'payout-snapshot-7',
  7,
);

/** FE-INT-3 — historical NULL snapshot; transfer `amount` still present. */
export const historicalNullSnapshotPayout: PayoutCommissionFixture = createPayoutFixture(
  'payout-historical-null',
  null,
  {
    productSold: null,
    shippingFees: null,
    commissionAmount: null,
    createdAt: '2025-12-01T00:00:00.000Z',
  },
);

/** FE-INT-3 / FIX-2 Arrange — live 10% must not overwrite snapshot 7% fours. */
export const liveTenPercentVsSnapshotSeven = {
  store: liveTenPercentStore,
  available: liveTenPercentAvailableSummary,
  snapshotPayout: snapshotSevenPercentPayout,
  historicalNullPayout: historicalNullSnapshotPayout,
} as const;

/** FIX-1 Arrange — panel available fours + pending manual snapshot. */
export const mixedCutoffWithPendingManual = {
  store: nullRateStore,
  available: mixedCutoffAvailableWithPendingSummary,
  pendingManual: pendingManualSnapshotPayout,
  fours: MIXED_CUTOFF_FOURS,
} as const;

export type UseAdminStoreMockResult = {
  data: AdminStoreCommissionFixture | undefined;
  isLoading: boolean;
  error: Error | null;
};

export type UseUpdateStoreAsAdminMockResult = {
  mutateAsync: (...args: unknown[]) => Promise<AdminStoreCommissionFixture>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

export type UsePayoutsQueryMockResult<T> = {
  data: T;
  isLoading: boolean;
};

export type UsePayoutsMutationMockResult = {
  mutate: (...args: unknown[]) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
};

export type UsePendingManualPayoutsMockResult = {
  data: Paginated<AdminManualPayoutCommissionFixture> | undefined;
  isLoading: boolean;
};

export function createUseAdminStoreMockResult(
  overrides?: Partial<UseAdminStoreMockResult>,
): UseAdminStoreMockResult {
  return {
    data: overrides?.data ?? nullRateStore,
    isLoading: overrides?.isLoading ?? false,
    error: overrides?.error ?? null,
  };
}

export function createUseUpdateStoreAsAdminMockResult(
  overrides?: Partial<UseUpdateStoreAsAdminMockResult>,
): UseUpdateStoreAsAdminMockResult {
  return {
    mutateAsync: overrides?.mutateAsync ?? (async () => nullRateStore),
    isPending: overrides?.isPending ?? false,
    isError: overrides?.isError ?? false,
    error: overrides?.error ?? null,
  };
}

export function createUsePayoutsQueryMockResult<T>(
  data: T,
  overrides?: Partial<Omit<UsePayoutsQueryMockResult<T>, 'data'>>,
): UsePayoutsQueryMockResult<T> {
  return {
    data,
    isLoading: overrides?.isLoading ?? false,
  };
}

export function createUsePayoutsMutationMockResult(
  overrides?: Partial<UsePayoutsMutationMockResult>,
): UsePayoutsMutationMockResult {
  return {
    mutate: overrides?.mutate ?? (() => undefined),
    isPending: overrides?.isPending ?? false,
    isError: overrides?.isError ?? false,
    isSuccess: overrides?.isSuccess ?? false,
    error: overrides?.error ?? null,
  };
}

export function createPendingManualPayoutsMockResult(
  items: AdminManualPayoutCommissionFixture[] = [pendingManualSnapshotPayout],
  overrides?: Partial<UsePendingManualPayoutsMockResult>,
): UsePendingManualPayoutsMockResult {
  return {
    data: overrides?.data ?? {
      items,
      pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
    },
    isLoading: overrides?.isLoading ?? false,
  };
}

/**
 * Documented mock wiring (vi.mock('@/hooks/useAdminStores') + vi.mock('@/hooks/usePayouts')).
 * Hook names must match page.test.tsx / skeletons.
 */
export const storeCommissionHookNames = [
  'useAdminStore',
  'useUpdateStoreAsAdmin',
  'useAdminStorePayoutSummary',
  'useAdminStorePayouts',
  'useTriggerPayout',
  'useSettleManualPayout',
  'useRejectManualPayout',
  'useStorePayoutSummary',
  'useStorePayouts',
  'usePendingManualPayouts',
] as const;

export type StoreCommissionHookName = (typeof storeCommissionHookNames)[number];

/** Phase 1+ implement target paths (relative to this directory). */
export const STORE_COMMISSION_INT_TEST_PATH = './store-commission.int.test.tsx' as const;
export const STORE_COMMISSION_FIXTURE_E2E_TEST_PATH =
  './store-commission.fixture.e2e.test.tsx' as const;
