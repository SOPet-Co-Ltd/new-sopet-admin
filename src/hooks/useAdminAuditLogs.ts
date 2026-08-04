'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminAuditLogs } from '@/lib/api/admin-audit-logs';
import { queryKeys } from '@/lib/react-query/keys';
import type { AdminAuditLogsQueryParams } from '@/types';

export function useAdminAuditLogs(params: AdminAuditLogsQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminAuditLogs.list(params),
    queryFn: () => getAdminAuditLogs(params),
  });
}
