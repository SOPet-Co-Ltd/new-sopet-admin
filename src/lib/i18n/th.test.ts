import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES } from '@/lib/config';
import {
  fulfillmentStatusLabels,
  labelFulfillmentStatus,
  labelNotificationType,
  labelOrderStatus,
  orderStatusLabels,
} from '@/lib/i18n/th';

describe('hold status labels (AC-016 / AC-034)', () => {
  it('maps order on_hold to พักการดำเนินการ', () => {
    expect(labelOrderStatus('on_hold')).toBe('พักการดำเนินการ');
    expect(orderStatusLabels.on_hold).toBe('พักการดำเนินการ');
  });

  it('maps fulfillment on_hold to พักจัดส่ง', () => {
    expect(labelFulfillmentStatus('on_hold')).toBe('พักจัดส่ง');
    expect(fulfillmentStatusLabels.on_hold).toBe('พักจัดส่ง');
  });

  it('omits on_hold from manual order status options (no set/clear toggle)', () => {
    expect(ORDER_STATUSES).not.toContain('on_hold');
    expect(ORDER_STATUSES).toEqual([
      'pending_payment',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ]);
  });

  it('does not expose set/clear hold copy in label maps', () => {
    const allLabels = [
      ...Object.values(orderStatusLabels),
      ...Object.values(fulfillmentStatusLabels),
    ].join(' ');
    expect(allLabels).not.toMatch(/ตั้งค่าพัก|เคลียร์พัก/);
  });
});

describe('vendor hold notification type labels (AC-028–AC-029)', () => {
  it('labels vendor enter-hold and resume notification types', () => {
    expect(labelNotificationType('vendor_order_items_on_hold')).toBe('คำสั่งซื้อถูกพักชั่วคราว');
    expect(labelNotificationType('vendor_order_items_hold_resumed')).toBe(
      'คำสั่งซื้อกลับมาดำเนินการได้แล้ว',
    );
  });
});
