'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';
import { labelNotificationType } from '@/lib/i18n/th';
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
  const isInteractive = Boolean(href) || !notification.isRead;
  const isUnread = !notification.isRead;
  const message = notification.message.trim();
  const title = notification.title.trim() || message;
  const showMessage = Boolean(message) && message !== title;

  const handleActivate = async () => {
    if (isUnread) {
      await onMarkRead();
    }
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        'min-h-14 rounded-xl border p-4 transition-[background-color,border-color] duration-200 ease-out',
        'motion-reduce:transition-none',
        isInteractive &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
        !isInteractive && 'cursor-default',
        isUnread
          ? 'border-border bg-card hover:bg-primary-tint/40'
          : 'border-transparent bg-surface hover:bg-surface/80',
      )}
      onClick={() => {
        if (!isInteractive) return;
        void handleActivate();
      }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `${isUnread ? 'ยังไม่อ่าน — ' : ''}${title}` : undefined}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleActivate();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full',
            isUnread ? 'bg-secondary/80' : 'border border-border bg-transparent',
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'min-w-0 flex-1 basis-48 text-sm text-ink text-pretty',
                isUnread ? 'font-semibold' : 'font-normal',
              )}
            >
              {title}
            </p>
            <span className="flex flex-wrap items-center gap-1.5">
              {isUnread ? (
                <Badge className="border-0 bg-secondary-tint text-secondary">ยังไม่อ่าน</Badge>
              ) : null}
              <Badge className="border-0 bg-tertiary-tint text-tertiary-hover">
                {labelNotificationType(notification.type)}
              </Badge>
            </span>
          </div>
          {showMessage ? (
            <p className="text-sm text-muted-foreground text-pretty">{message}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <time
              className="text-xs text-muted-foreground"
              dateTime={notification.createdAt.toISOString()}
            >
              {formatDateTime(notification.createdAt)}
            </time>
            {href ? (
              <span className="text-xs font-medium text-secondary-hover">ดูรายละเอียด</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
