'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrderAuditLog } from '@/lib/api/order-audit-logs';
import { queryKeys } from '@/lib/react-query/keys';

export function useOrderAuditLog(orderId?: string, storeId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.auditLog(orderId ?? '', storeId ?? ''),
    queryFn: () => getOrderAuditLog(orderId!, storeId!),
    enabled: Boolean(orderId && storeId),
  });
}
