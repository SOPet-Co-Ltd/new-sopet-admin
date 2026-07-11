'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import {
  NotificationsDocument,
  MarkNotificationReadDocument,
  MarkAllNotificationsReadDocument,
} from '@/lib/graphql/generated/graphql';
import { mapNotification } from '@/lib/api/notifications';

export function useNotifications(unreadOnly = false) {
  const { data, loading, error, refetch } = useQuery(NotificationsDocument, {
    variables: { unreadOnly },
    pollInterval: unreadOnly ? 15_000 : 0,
  });

  const notifications = data?.notifications
    ? data.notifications.map((n) =>
        mapNotification({
          id: n.id,
          type: n.type,
          title: n.title ?? null,
          message: n.message,
          metadata: n.metadata ?? null,
          isRead: n.isRead,
          createdAt: n.createdAt,
        }),
      )
    : [];

  return {
    notifications,
    loading,
    error,
    refetch,
  };
}

export function useMarkNotificationRead() {
  return useMutation(MarkNotificationReadDocument, { refetchQueries: [NotificationsDocument] });
}

export function useMarkAllNotificationsRead() {
  return useMutation(MarkAllNotificationsReadDocument, { refetchQueries: [NotificationsDocument] });
}
