import type { Notification } from '@/lib/api/notifications';

export type NotificationContext = 'admin' | 'vendor';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function getNotificationHref(
  notification: Notification,
  context: NotificationContext,
): string | null {
  const { type, metadata } = notification;

  if (context === 'admin') {
    switch (type) {
      case 'new_store_request': {
        const requestId = asString(metadata.requestId) ?? asString(metadata.storeRequestId);
        return requestId
          ? `/admin/requests?tab=stores&requestId=${encodeURIComponent(requestId)}`
          : '/admin/requests?tab=stores';
      }
      default:
        return null;
    }
  }

  switch (type) {
    case 'store_status_changed': {
      const storeId = asString(metadata.storeId);
      return storeId ? `/vendor/stores?storeId=${encodeURIComponent(storeId)}` : '/vendor/stores';
    }
    case 'new_order':
    case 'order_status_changed': {
      const orderId = asString(metadata.orderId);
      return orderId ? `/vendor/orders?orderId=${encodeURIComponent(orderId)}` : '/vendor/orders';
    }
    case 'request_status_changed': {
      if (metadata.type === 'store_request') {
        const storeId = asString(metadata.storeId);
        return storeId ? `/vendor/stores?storeId=${encodeURIComponent(storeId)}` : '/vendor/stores';
      }
      return '/vendor/stores';
    }
    default:
      return null;
  }
}
