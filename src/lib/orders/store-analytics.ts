import { labelPaymentMethod } from '@/lib/i18n/th';
import {
  getStoreDiscountAmount,
  getStoreOrderItems,
  getStoreOrderTotal,
  getStoreShipping,
  sumItemSubtotals,
} from '@/lib/orders/display';
import type { Order } from '@/types';
import type { SalesBreakdownItem, SalesTimePoint, TopProduct } from '@/types';
import { computeTopProductsFromOrders } from '@/lib/orders/top-products';

export type AnalyticsPeriod = '7d' | '30d' | 'all';

const EXCLUDED_ORDER_STATUSES = new Set(['cancelled', 'refunded']);

export type StoreAnalyticsSnapshot = {
  grossRevenue: number;
  discountAmount: number;
  shippingRevenue: number;
  netRevenue: number;
  orderCount: number;
  unitsSold: number;
  averageOrderValue: number;
};

export function getAnalyticsPeriodRange(period: AnalyticsPeriod): { from?: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  if (period === 'all') {
    return { to };
  }

  const from = new Date();
  from.setDate(from.getDate() - (period === '7d' ? 7 : 30));
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

export function getAnalyticsPeriodLabel(period: AnalyticsPeriod): string {
  if (period === '7d') return '7 วันล่าสุด';
  if (period === '30d') return '30 วันล่าสุด';
  return 'ทั้งหมด';
}

function isOrderInAnalyticsScope(order: Order, from?: Date, to?: Date): boolean {
  if (EXCLUDED_ORDER_STATUSES.has(order.status)) {
    return false;
  }

  const createdAt = new Date(order.createdAt);
  if (from && createdAt < from) {
    return false;
  }
  if (to && createdAt > to) {
    return false;
  }

  return true;
}

function filterStoreOrders(orders: Order[], storeId: string, from?: Date, to?: Date): Order[] {
  return orders.filter(
    (order) =>
      isOrderInAnalyticsScope(order, from, to) && getStoreOrderItems(order, storeId).length > 0,
  );
}

export function computeStoreAnalyticsSnapshot(
  orders: Order[],
  storeId: string,
  period: AnalyticsPeriod,
): StoreAnalyticsSnapshot {
  const { from, to } = getAnalyticsPeriodRange(period);
  const scopedOrders = filterStoreOrders(orders, storeId, from, to);

  let grossRevenue = 0;
  let discountAmount = 0;
  let shippingRevenue = 0;
  let unitsSold = 0;

  for (const order of scopedOrders) {
    const storeItems = getStoreOrderItems(order, storeId);
    grossRevenue += sumItemSubtotals(storeItems);
    discountAmount += getStoreDiscountAmount(order, storeId);
    shippingRevenue += getStoreShipping(order, storeId)?.shippingFee ?? 0;
    unitsSold += storeItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  const netRevenue = scopedOrders.reduce(
    (sum, order) => sum + getStoreOrderTotal(order, storeId),
    0,
  );
  const orderCount = scopedOrders.length;

  return {
    grossRevenue,
    discountAmount,
    shippingRevenue,
    netRevenue,
    orderCount,
    unitsSold,
    averageOrderValue: orderCount > 0 ? netRevenue / orderCount : 0,
  };
}

export function computeStoreSalesOverTime(
  orders: Order[],
  storeId: string,
  period: AnalyticsPeriod,
): SalesTimePoint[] {
  const { from, to } = getAnalyticsPeriodRange(period);
  const scopedOrders = filterStoreOrders(orders, storeId, from, to);
  const points = new Map<string, SalesTimePoint>();

  for (const order of scopedOrders) {
    const date = order.createdAt.slice(0, 10);
    const current = points.get(date) ?? { date, revenue: 0, orderCount: 0 };
    current.revenue += getStoreOrderTotal(order, storeId);
    current.orderCount += 1;
    points.set(date, current);
  }

  if (period === 'all' || points.size === 0) {
    return [...points.values()].sort((left, right) => left.date.localeCompare(right.date));
  }

  const filled: SalesTimePoint[] = [];
  const cursor = new Date(from ?? to);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    filled.push(points.get(date) ?? { date, revenue: 0, orderCount: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return filled;
}

export function computeStoreSalesByPayment(
  orders: Order[],
  storeId: string,
  period: AnalyticsPeriod,
): SalesBreakdownItem[] {
  const { from, to } = getAnalyticsPeriodRange(period);
  const scopedOrders = filterStoreOrders(orders, storeId, from, to);
  const buckets = new Map<string, SalesBreakdownItem>();

  for (const order of scopedOrders) {
    const label = labelPaymentMethod(order.paymentMethod);
    const current = buckets.get(label) ?? { label, revenue: 0, orderCount: 0 };
    current.revenue += getStoreOrderTotal(order, storeId);
    current.orderCount += 1;
    buckets.set(label, current);
  }

  return [...buckets.values()].sort((left, right) => right.revenue - left.revenue);
}

export function computeStoreTopProducts(
  orders: Order[],
  storeId: string,
  period: AnalyticsPeriod,
  limit = 5,
): TopProduct[] {
  // Derived from already-fetched vendor orders to avoid a separate topProducts GraphQL round-trip.
  const { from, to } = getAnalyticsPeriodRange(period);
  const scopedOrders = filterStoreOrders(orders, storeId, from, to);
  return computeTopProductsFromOrders(scopedOrders, storeId, limit);
}
