import { executeQuery } from '@/lib/graphql/client';
import {
  CUSTOMER_PURCHASE_SUMMARY_QUERY,
  STORE_CUSTOMER_SUMMARY_QUERY,
} from '@/lib/graphql/documents';
import type { CustomerPurchaseSummary, StoreCustomerSummary } from '@/types';

type GqlStoreCustomerSummary = {
  year: number;
  month: number;
  lifetimeMonths?: number | null;
  repeatRate?: number | null;
  purchasesPerMonth?: number | null;
  averageOrderValue?: number | null;
  newCustomerCount: number;
  oldCustomerCount: number;
  oldCustomerPercent?: number | null;
  orderCount: number;
  buyersInMonth: number;
  totalCustomers: number;
};

type GqlCustomerPurchaseSummary = {
  year: number;
  month: number;
  purchasesInMonth: number;
  averageOrderValue?: number | null;
  cohortLabel: string;
  cohortLabelTh: string;
  lastOrderAt?: string | null;
  monthsSinceLastOrder?: number | null;
  daysSinceLastOrder?: number | null;
};

function mapStoreCustomerSummary(raw: GqlStoreCustomerSummary): StoreCustomerSummary {
  return {
    year: raw.year,
    month: raw.month,
    lifetimeMonths: raw.lifetimeMonths ?? null,
    repeatRate: raw.repeatRate ?? null,
    purchasesPerMonth: raw.purchasesPerMonth ?? null,
    averageOrderValue: raw.averageOrderValue ?? null,
    newCustomerCount: raw.newCustomerCount,
    oldCustomerCount: raw.oldCustomerCount,
    oldCustomerPercent: raw.oldCustomerPercent ?? null,
    orderCount: raw.orderCount,
    buyersInMonth: raw.buyersInMonth,
    totalCustomers: raw.totalCustomers,
  };
}

function mapCustomerPurchaseSummary(raw: GqlCustomerPurchaseSummary): CustomerPurchaseSummary {
  return {
    year: raw.year,
    month: raw.month,
    purchasesInMonth: raw.purchasesInMonth,
    averageOrderValue: raw.averageOrderValue ?? null,
    cohortLabel: raw.cohortLabel,
    cohortLabelTh: raw.cohortLabelTh,
    lastOrderAt: raw.lastOrderAt ?? null,
    monthsSinceLastOrder: raw.monthsSinceLastOrder ?? null,
    daysSinceLastOrder: raw.daysSinceLastOrder ?? null,
  };
}

export function getStoreCustomerSummary(
  storeId: string,
  year: number,
  month: number,
): Promise<StoreCustomerSummary> {
  return executeQuery<{ storeCustomerSummary: GqlStoreCustomerSummary }>(
    STORE_CUSTOMER_SUMMARY_QUERY,
    { storeId, year, month },
  ).then((data) => mapStoreCustomerSummary(data.storeCustomerSummary));
}

export function getCustomerPurchaseSummary(
  customerId: string,
  year: number,
  month: number,
): Promise<CustomerPurchaseSummary> {
  return executeQuery<{ customerPurchaseSummary: GqlCustomerPurchaseSummary }>(
    CUSTOMER_PURCHASE_SUMMARY_QUERY,
    { customerId, year, month },
  ).then((data) => mapCustomerPurchaseSummary(data.customerPurchaseSummary));
}
