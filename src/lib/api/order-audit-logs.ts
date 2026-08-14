import { executeQuery } from '@/lib/graphql/client';
import { ORDER_AUDIT_LOG_QUERY } from '@/lib/graphql/documents';
import type { OrderAuditLog, OrderAuditLogEntry } from '@/types';

type GqlOrderAuditLog = {
  orderId: string;
  entries: OrderAuditLogEntry[];
};

export function getOrderAuditLog(orderId: string, storeId: string): Promise<OrderAuditLog> {
  return executeQuery<{ orderAuditLog: GqlOrderAuditLog }>(ORDER_AUDIT_LOG_QUERY, {
    orderId,
    storeId,
  }).then((data) => ({
    orderId: data.orderAuditLog.orderId,
    entries: data.orderAuditLog.entries,
  }));
}
