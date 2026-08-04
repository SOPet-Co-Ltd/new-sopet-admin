import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_PAYOUTS_QUERY,
  ADMIN_STORE_PAYOUT_SUMMARY_QUERY,
  REQUEST_PAYOUT_MUTATION,
  STORE_PAYOUTS_QUERY,
  STORE_PAYOUT_SUMMARY_QUERY,
  TRIGGER_PAYOUT_MUTATION,
} from '@/lib/graphql/documents';
import type { Payout, PayoutSummary } from '@/types';

type GqlPayoutSummary = PayoutSummary;
type GqlPayout = Payout;

function mapPayoutSummary(summary: GqlPayoutSummary): PayoutSummary {
  return {
    storeId: summary.storeId,
    grossRevenue: Number(summary.grossRevenue),
    totalPaidOut: Number(summary.totalPaidOut),
    availableBalance: Number(summary.availableBalance),
    pendingPayoutAmount: Number(summary.pendingPayoutAmount),
    minimumPayoutAmount: Number(summary.minimumPayoutAmount),
    canRequestPayout: summary.canRequestPayout,
  };
}

function mapPayout(payout: GqlPayout): Payout {
  return {
    id: payout.id,
    storeId: payout.storeId,
    amount: Number(payout.amount),
    netAmount: Number(payout.netAmount),
    status: payout.status,
    createdAt: payout.createdAt,
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

export function requestPayout(): Promise<Payout> {
  return executeMutation<{ requestPayout: GqlPayout }>(REQUEST_PAYOUT_MUTATION).then((data) =>
    mapPayout(data.requestPayout),
  );
}

export function triggerPayout(input: { storeId: string; amount?: number }): Promise<Payout> {
  return executeMutation<{ triggerPayout: GqlPayout }>(TRIGGER_PAYOUT_MUTATION, { input }).then(
    (data) => mapPayout(data.triggerPayout),
  );
}
