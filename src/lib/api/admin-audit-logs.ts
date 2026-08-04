import { executeQuery } from '@/lib/graphql/client';
import { ADMIN_AUDIT_LOGS_QUERY } from '@/lib/graphql/documents';
import type { AdminAuditLog, AdminAuditLogsQueryParams, Paginated } from '@/types';

type GqlAdminAuditLog = {
  id: string;
  actorType: AdminAuditLog['actorType'];
  actorId?: string | null;
  actorLabel?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
};

function mapAdminAuditLog(log: GqlAdminAuditLog): AdminAuditLog {
  return {
    id: log.id,
    actorType: log.actorType,
    actorId: log.actorId,
    actorLabel: log.actorLabel,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt,
  };
}

export function getAdminAuditLogs(
  params: AdminAuditLogsQueryParams,
): Promise<Paginated<AdminAuditLog>> {
  const filter = {
    action: params.action || undefined,
    resourceType: params.resourceType || undefined,
    actorType: params.actorType || undefined,
    actorId: params.actorId || undefined,
    search: params.search || undefined,
    fromDate: params.fromDate || undefined,
    toDate: params.toDate || undefined,
  };

  return executeQuery<{
    adminAuditLogs: {
      items: GqlAdminAuditLog[];
      pagination: Paginated<AdminAuditLog>['pagination'];
    };
  }>(ADMIN_AUDIT_LOGS_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    filter: Object.values(filter).some(Boolean) ? filter : undefined,
  }).then((data) => ({
    items: data.adminAuditLogs.items.map(mapAdminAuditLog),
    pagination: data.adminAuditLogs.pagination,
  }));
}
