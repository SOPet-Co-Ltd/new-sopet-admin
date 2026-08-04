import type { Order } from '@/types';
import {
  getVendorOrderWorkflowAction,
  type VendorOrderWorkflowAction,
} from '@/lib/orders/workflow';

export const VENDOR_ACTIONABLE_WORKFLOW_ACTIONS = [
  'mark_paid',
  'acknowledge',
  'ship',
] as const satisfies readonly VendorOrderWorkflowAction[];

export function isVendorActionableOrder(order: Order, storeId?: string): boolean {
  const action = getVendorOrderWorkflowAction(order, storeId);
  return (VENDOR_ACTIONABLE_WORKFLOW_ACTIONS as readonly string[]).includes(action);
}

export function filterVendorActionableOrders(orders: Order[], storeId?: string): Order[] {
  return orders
    .filter((order) => isVendorActionableOrder(order, storeId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function labelVendorWorkflowAction(action: VendorOrderWorkflowAction): string {
  switch (action) {
    case 'mark_paid':
      return 'ยืนยันชำระเงิน';
    case 'acknowledge':
      return 'รับออเดอร์';
    case 'ship':
      return 'จัดส่ง';
    case 'awaiting_customer':
      return 'รอลูกค้ารับสินค้า';
    case 'completed':
      return 'เสร็จสิ้น';
    default:
      return '—';
  }
}
