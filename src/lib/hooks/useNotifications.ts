'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  NotificationsDocument,
  MarkNotificationReadDocument,
  MarkAllNotificationsReadDocument,
} from '@/lib/graphql/generated/graphql';
import { mapNotification } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/react-query/keys';

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
  // The unread-count badge in admin/vendor layouts reads via a separate TanStack Query
  // hook (`@/hooks/useUnreadCount`, backed by its own executeQuery client) rather than this
  // Apollo-cached hook - refetchQueries only refetches Apollo's own active queries, so without
  // this the badge stayed stale until its own next mount/poll, well after the notification
  // was actually marked read here.
  const queryClient = useQueryClient();
  return useMutation(MarkNotificationReadDocument, {
    refetchQueries: [NotificationsDocument],
    onCompleted: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation(MarkAllNotificationsReadDocument, {
    refetchQueries: [NotificationsDocument],
    onCompleted: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
