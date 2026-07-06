'use client';

import { useState } from 'react';
import { HiBell } from 'react-icons/hi2';
import { cn } from '@/lib/utils';
import { NotificationCard } from '@/components/notifications/notification-card';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/hooks/useNotifications';

export default function VendorNotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { notifications, loading, refetch } = useNotifications(tab === 'unread');
  const [markRead] = useMarkNotificationRead();
  const [markAll] = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await markRead({ variables: { id } });
  };

  const handleMarkAllRead = async () => {
    await markAll();
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">การแจ้งเตือน</h1>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              tab === 'all' ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
            onClick={() => setTab('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={cn(
              'px-4 py-1.5 text-sm rounded-md transition-colors',
              tab === 'unread' ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
            onClick={() => setTab('unread')}
          >
            ยังไม่อ่าน
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-brand text-white text-xs px-1.5">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            อ่านทั้งหมดแล้ว
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted">กำลังโหลด...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center">
            <HiBell className="h-12 w-12 text-muted" />
            <p className="mt-4 text-sm text-muted">
              {tab === 'unread' ? 'ไม่มีรายการที่ไม่ได้อ่าน' : 'ยังไม่มีแจ้งเตือน'}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              context="vendor"
              onMarkRead={() => handleMarkRead(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
