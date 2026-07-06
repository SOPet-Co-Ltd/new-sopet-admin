'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/api/notifications';
import { getNotificationHref, type NotificationContext } from '@/lib/notifications/routes';

type NotificationCardProps = {
  notification: Notification;
  context: NotificationContext;
  onMarkRead: () => void | Promise<void>;
};

export function NotificationCard({ notification, context, onMarkRead }: NotificationCardProps) {
  const router = useRouter();
  const href = getNotificationHref(notification, context);

  const handleClick = async () => {
    if (!notification.isRead) {
      await onMarkRead();
    }
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        href || !notification.isRead ? 'cursor-pointer' : 'cursor-default',
        notification.isRead ? 'border-border bg-card' : 'border-brand/30 bg-card shadow-sm',
      )}
      onClick={() => void handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') void handleClick();
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'shrink-0 h-2.5 w-2.5 rounded-full mt-1.5',
            notification.isRead ? 'bg-transparent' : 'bg-brand',
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-ink">{notification.title}</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-tint text-brand">
              {notification.type}
            </span>
          </div>
          <p className="text-sm text-muted">{notification.message}</p>
          <p className="text-xs text-muted mt-2">
            {notification.createdAt.toLocaleString('th-TH')}
          </p>
          {href ? <p className="text-xs text-brand mt-1">คลิกเพื่อดูรายละเอียด</p> : null}
        </div>
      </div>
    </div>
  );
}
