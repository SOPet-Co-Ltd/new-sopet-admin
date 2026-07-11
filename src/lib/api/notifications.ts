import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  NOTIFICATIONS_QUERY,
  UNREAD_COUNT_QUERY,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from '@/lib/graphql/documents';

export function getNotifications(
  unreadOnly?: boolean,
): Promise<GqlNotification[] | Notification[]> {
  return executeQuery<{ notifications: GqlNotification[] }>(NOTIFICATIONS_QUERY, {
    unreadOnly,
  }).then((data) => data.notifications.map(mapNotification));
}

export function getUnreadCount(): Promise<number> {
  return executeQuery<{ unreadNotificationsCount: number }>(UNREAD_COUNT_QUERY).then(
    (data) => data.unreadNotificationsCount,
  );
}

export function markNotificationRead(id: string): Promise<boolean> {
  return executeMutation<{ markNotificationRead: boolean }>(MARK_NOTIFICATION_READ, { id }).then(
    (data) => data.markNotificationRead,
  );
}

export function markAllNotificationsRead(): Promise<boolean> {
  return executeMutation<{ markAllNotificationsRead: boolean }>(MARK_ALL_NOTIFICATIONS_READ).then(
    (data) => data.markAllNotificationsRead,
  );
}

type GqlNotification = {
  id: string;
  type: string;
  title: string | null;
  message: string;
  metadata: string | null;
  isRead: boolean;
  createdAt: string;
};

export function mapNotification(gql: GqlNotification): Notification {
  return {
    id: gql.id,
    type: gql.type,
    title: gql.title ?? '',
    message: gql.message,
    metadata: gql.metadata ? JSON.parse(gql.metadata) : {},
    isRead: gql.isRead,
    createdAt: new Date(gql.createdAt),
  };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}
