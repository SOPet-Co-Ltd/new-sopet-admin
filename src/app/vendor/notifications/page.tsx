'use client';

import { useId, useState } from 'react';
import { HiBell } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { NotificationCard } from '@/components/notifications/notification-card';
import { NotificationListSkeleton } from '@/components/notifications/notification-list-skeleton';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils';

export default function VendorNotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const panelId = useId();
  const { notifications, loading, error, refetch } = useNotifications(tab === 'unread');
  const [markRead] = useMarkNotificationRead();
  const [markAll, { loading: markingAll }] = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await markRead({ variables: { id } });
  };

  const handleMarkAllRead = async () => {
    await markAll();
    await refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="การแจ้งเตือน"
        description="อัปเดตจากคำสั่งซื้อ ร้านค้า และระบบ"
        action={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 min-w-30 sm:min-h-8"
              disabled={markingAll || loading}
              aria-busy={markingAll}
              onClick={() => void handleMarkAllRead()}
            >
              {markingAll ? 'กำลังทำเครื่องหมาย…' : 'อ่านทั้งหมดแล้ว'}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="กรองการแจ้งเตือน">
        <Button
          type="button"
          role="tab"
          id={`${panelId}-tab-all`}
          aria-selected={tab === 'all'}
          aria-controls={`${panelId}-panel`}
          variant={tab === 'all' ? 'default' : 'outline'}
          className="min-h-10 transition-colors duration-150 motion-reduce:transition-none"
          onClick={() => setTab('all')}
        >
          ทั้งหมด
        </Button>
        <Button
          type="button"
          role="tab"
          id={`${panelId}-tab-unread`}
          aria-selected={tab === 'unread'}
          aria-controls={`${panelId}-panel`}
          variant={tab === 'unread' ? 'default' : 'outline'}
          className="min-h-10 transition-colors duration-150 motion-reduce:transition-none"
          onClick={() => setTab('unread')}
        >
          ยังไม่อ่าน
          {unreadCount > 0 ? (
            <span
              className={cn(
                'ml-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                tab === 'unread' ? 'bg-white text-primary' : 'bg-secondary-tint text-secondary',
              )}
            >
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </div>

      <div
        id={`${panelId}-panel`}
        role="tabpanel"
        aria-labelledby={`${panelId}-tab-${tab}`}
        className="space-y-3"
      >
        {loading ? <NotificationListSkeleton /> : null}

        {!loading && error ? (
          <div className="rounded-xl bg-danger-bg px-4 py-3" role="alert">
            <p className="text-sm font-medium text-danger">โหลดการแจ้งเตือนไม่สำเร็จ</p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 min-h-10"
              onClick={() => void refetch()}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : null}

        {!loading && !error && notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl bg-surface px-6 py-14 text-center"
            role="status"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-muted-foreground">
              <HiBell className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink">
              {tab === 'unread' ? 'ไม่มีรายการที่ไม่ได้อ่าน' : 'ยังไม่มีแจ้งเตือน'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
              {tab === 'unread'
                ? 'เมื่อมีอัปเดตใหม่ที่ยังไม่ได้อ่าน จะแสดงที่นี่'
                : 'เมื่อมีคำสั่งซื้อหรืออัปเดตร้านค้า การแจ้งเตือนจะปรากฏที่นี่'}
            </p>
          </div>
        ) : null}

        {!loading && !error
          ? notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                context="vendor"
                onMarkRead={() => handleMarkRead(n.id)}
              />
            ))
          : null}
      </div>
    </div>
  );
}
