import { describe, expect, it } from 'vitest';
import type { Notification } from '@/lib/api/notifications';
import { getNotificationHref } from './routes';

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'new_store_request',
    title: 'Test',
    message: 'Test message',
    metadata: {},
    isRead: false,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('getNotificationHref', () => {
  describe('admin', () => {
    it('links new_store_request to requests page with requestId', () => {
      const href = getNotificationHref(
        notification({
          type: 'new_store_request',
          metadata: { requestId: 'req-123', storeName: 'My Store' },
        }),
        'admin',
      );

      expect(href).toBe('/admin/requests?tab=stores&requestId=req-123');
    });

    it('falls back to storeRequestId metadata key', () => {
      const href = getNotificationHref(
        notification({
          type: 'new_store_request',
          metadata: { storeRequestId: 'req-456' },
        }),
        'admin',
      );

      expect(href).toBe('/admin/requests?tab=stores&requestId=req-456');
    });

    it('links to requests list when request id is missing', () => {
      const href = getNotificationHref(
        notification({ type: 'new_store_request', metadata: {} }),
        'admin',
      );

      expect(href).toBe('/admin/requests?tab=stores');
    });

    it('returns null for unknown admin notification types', () => {
      const href = getNotificationHref(notification({ type: 'unknown_type' }), 'admin');

      expect(href).toBeNull();
    });
  });

  describe('vendor', () => {
    it('links new_order to orders page', () => {
      const href = getNotificationHref(
        notification({ type: 'new_order', metadata: { orderId: 'order-1' } }),
        'vendor',
      );

      expect(href).toBe('/vendor/orders?orderId=order-1');
    });

    it('links store_status_changed to stores page', () => {
      const href = getNotificationHref(
        notification({ type: 'store_status_changed', metadata: { storeId: 'store-1' } }),
        'vendor',
      );

      expect(href).toBe('/vendor/stores?storeId=store-1');
    });
  });
});
