import { describe, expect, it } from 'vitest';
import { getNotificationHref } from './routes';
import type { Notification } from '@/lib/api/notifications';

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'new_order',
    title: 'ออเดอร์ใหม่',
    message: 'มีออเดอร์ใหม่',
    metadata: { orderId: 'order-1' },
    isRead: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('getNotificationHref', () => {
  it('routes vendor order notifications to vendor order detail page', () => {
    expect(getNotificationHref(notification(), 'vendor')).toBe('/vendor/orders/order-1');
  });

  it('routes admin store requests to admin requests page', () => {
    const href = getNotificationHref(
      notification({
        type: 'new_store_request',
        metadata: { requestId: 'req-1' },
      }),
      'admin',
    );

    expect(href).toBe('/admin/requests?tab=stores&requestId=req-1');
  });
});
