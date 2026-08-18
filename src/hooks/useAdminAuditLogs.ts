'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getAdminAuditLogs } from '@/lib/api/admin-audit-logs';
import { queryKeys } from '@/lib/react-query/keys';
import type { AdminAuditLogsQueryParams } from '@/types';

const POLL_INTERVAL_MS = 12_000;

function readDocumentVisible(): boolean {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
}

export function useAdminAuditLogs(params: AdminAuditLogsQueryParams) {
  const [isDocumentVisible, setIsDocumentVisible] = useState(readDocumentVisible);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsDocumentVisible(readDocumentVisible());
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return useQuery({
    queryKey: queryKeys.adminAuditLogs.list(params),
    queryFn: () => getAdminAuditLogs(params),
    refetchInterval: isDocumentVisible ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
  });
}
