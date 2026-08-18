import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_PAYOUTS_QUERY,
  ADMIN_STORE_PAYOUT_SUMMARY_QUERY,
  PENDING_MANUAL_PAYOUTS_QUERY,
  REJECT_MANUAL_PAYOUT_MUTATION,
  REQUEST_MANUAL_PAYOUT_MUTATION,
  REQUEST_PAYOUT_MUTATION,
  SETTLE_MANUAL_PAYOUT_MUTATION,
  STORE_PAYOUTS_QUERY,
  STORE_PAYOUT_SUMMARY_QUERY,
  TRIGGER_PAYOUT_MUTATION,
} from '@/lib/graphql/documents';
import { mapPagination } from '@/lib/graphql/mappers';
import type { Paginated, Payout, PayoutRailSummary, PayoutSummary } from '@/types';

type GqlPayoutSummary = PayoutSummary;
type GqlPayout = Payout;

function mapRail(rail: PayoutRailSummary): PayoutRailSummary {
  return {
    grossRevenue: Number(rail.grossRevenue),
    totalPaidOut: Number(rail.totalPaidOut),
    availableBalance: Number(rail.availableBalance),
    pendingPayoutAmount: Number(rail.pendingPayoutAmount),
    canRequestPayout: rail.canRequestPayout,
    productSold: Number(rail.productSold),
    shippingFees: Number(rail.shippingFees),
    commissionAmount: Number(rail.commissionAmount),
    commissionRate: rail.commissionRate == null ? null : Number(rail.commissionRate),
  };
}

function mapPayoutSummary(summary: GqlPayoutSummary): PayoutSummary {
  return {
    storeId: summary.storeId,
    grossRevenue: Number(summary.grossRevenue),
    totalPaidOut: Number(summary.totalPaidOut),
    availableBalance: Number(summary.availableBalance),
    pendingPayoutAmount: Number(summary.pendingPayoutAmount),
    minimumPayoutAmount: Number(summary.minimumPayoutAmount),
    canRequestPayout: summary.canRequestPayout,
    productSold: Number(summary.productSold),
    shippingFees: Number(summary.shippingFees),
    commissionAmount: Number(summary.commissionAmount),
    commissionRate: summary.commissionRate == null ? null : Number(summary.commissionRate),
    omise: mapRail(summary.omise),
    manual: mapRail(summary.manual),
  };
}

function mapNullableMoney(value: number | null | undefined): number | null {
  return value == null ? null : Number(value);
}

function mapPayout(payout: GqlPayout): Payout {
  return {
    id: payout.id,
    storeId: payout.storeId,
    amount: Number(payout.amount),
    netAmount: Number(payout.netAmount),
    status: payout.status,
    settlementRail: payout.settlementRail,
    createdAt: payout.createdAt,
    productSold: mapNullableMoney(payout.productSold),
    shippingFees: mapNullableMoney(payout.shippingFees),
    commissionAmount: mapNullableMoney(payout.commissionAmount),
    commissionRate: mapNullableMoney(payout.commissionRate),
  };
}

export function getStorePayoutSummary(): Promise<PayoutSummary> {
  return executeQuery<{ storePayoutSummary: GqlPayoutSummary }>(STORE_PAYOUT_SUMMARY_QUERY).then(
    (data) => mapPayoutSummary(data.storePayoutSummary),
  );
}

export function getAdminStorePayoutSummary(storeId: string): Promise<PayoutSummary> {
  return executeQuery<{ adminStorePayoutSummary: GqlPayoutSummary }>(
    ADMIN_STORE_PAYOUT_SUMMARY_QUERY,
    { storeId },
  ).then((data) => mapPayoutSummary(data.adminStorePayoutSummary));
}

export function getStorePayouts(): Promise<Payout[]> {
  return executeQuery<{ storePayouts: GqlPayout[] }>(STORE_PAYOUTS_QUERY).then((data) =>
    data.storePayouts.map(mapPayout),
  );
}

export function getAdminStorePayouts(storeId: string): Promise<Payout[]> {
  return executeQuery<{ adminStorePayouts: GqlPayout[] }>(ADMIN_STORE_PAYOUTS_QUERY, {
    storeId,
  }).then((data) => data.adminStorePayouts.map(mapPayout));
}

export type AdminManualPayout = Payout & {
  storeName: string;
  bankName: string | null;
  bankCode: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
};

export const ADMIN_MANUAL_PAYOUT_PAGE_SIZE = 20;

export function getPendingManualPayouts(
  page = 1,
  limit = ADMIN_MANUAL_PAYOUT_PAGE_SIZE,
): Promise<Paginated<AdminManualPayout>> {
  return executeQuery<{
    pendingManualPayouts: {
      items: Array<
        GqlPayout & {
          storeName: string;
          bankName: string | null;
          bankCode: string | null;
          bankAccountName: string | null;
          bankAccountNumber: string | null;
        }
      >;
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(PENDING_MANUAL_PAYOUTS_QUERY, { page, limit }).then((data) => ({
    items: data.pendingManualPayouts.items.map((payout) => ({
      ...mapPayout(payout),
      storeName: payout.storeName,
      bankName: payout.bankName,
      bankCode: payout.bankCode,
      bankAccountName: payout.bankAccountName,
      bankAccountNumber: payout.bankAccountNumber,
    })),
    pagination: mapPagination(data.pendingManualPayouts.pagination),
  }));
}

export function requestPayout(): Promise<Payout> {
  return executeMutation<{ requestPayout: GqlPayout }>(REQUEST_PAYOUT_MUTATION).then((data) =>
    mapPayout(data.requestPayout),
  );
}

export function requestManualPayout(): Promise<Payout> {
  return executeMutation<{ requestManualPayout: GqlPayout }>(REQUEST_MANUAL_PAYOUT_MUTATION).then(
    (data) => mapPayout(data.requestManualPayout),
  );
}

export function triggerPayout(input: { storeId: string; amount?: number }): Promise<Payout> {
  return executeMutation<{ triggerPayout: GqlPayout }>(TRIGGER_PAYOUT_MUTATION, { input }).then(
    (data) => mapPayout(data.triggerPayout),
  );
}

export function settleManualPayout(input: {
  storeId: string;
  payoutId?: string;
  notes?: string;
}): Promise<Payout> {
  return executeMutation<{ settleManualPayout: GqlPayout }>(SETTLE_MANUAL_PAYOUT_MUTATION, {
    input,
  }).then((data) => mapPayout(data.settleManualPayout));
}

export function rejectManualPayout(input: {
  storeId: string;
  payoutId?: string;
  notes?: string;
}): Promise<Payout> {
  return executeMutation<{ rejectManualPayout: GqlPayout }>(REJECT_MANUAL_PAYOUT_MUTATION, {
    input,
  }).then((data) => mapPayout(data.rejectManualPayout));
}
