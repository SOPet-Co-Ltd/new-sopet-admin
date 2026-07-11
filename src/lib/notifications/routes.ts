import type { Notification } from '@/lib/api/notifications';

export type NotificationContext = 'admin' | 'vendor';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseMetadata(metadata: Notification['metadata']): Record<string, unknown> | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'object') {
    return metadata as Record<string, unknown>;
  }

  if (typeof metadata !== 'string') {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(metadata);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getNotificationHref(
  notification: Notification,
  context: NotificationContext,
): string | null {
  const { type, metadata } = notification;
  const parsedMetadata = parseMetadata(metadata);

  if (context === 'admin') {
    switch (type) {
      case 'new_store_request': {
        const requestId =
          asString(parsedMetadata?.requestId) ?? asString(parsedMetadata?.storeRequestId);
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
      const storeId = asString(parsedMetadata?.storeId);
      return storeId ? `/vendor/stores?storeId=${encodeURIComponent(storeId)}` : '/vendor/stores';
    }
    case 'new_order':
    case 'order_status_changed': {
      const orderId = asString(parsedMetadata?.orderId);
      return orderId ? `/vendor/orders?orderId=${encodeURIComponent(orderId)}` : '/vendor/orders';
    }
    case 'request_status_changed': {
      if (parsedMetadata?.type === 'store_request') {
        const storeId = asString(parsedMetadata?.storeId);
        return storeId ? `/vendor/stores?storeId=${encodeURIComponent(storeId)}` : '/vendor/stores';
      }
      return '/vendor/stores';
    }
    default:
      return null;
  }
}
