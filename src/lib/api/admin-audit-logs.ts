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
  requestId?: string | null;
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
    requestId: log.requestId,
    createdAt: log.createdAt,
  };
}

function buildAdminAuditLogFilter(params: AdminAuditLogsQueryParams) {
  const filter: Record<string, string> = {};

  if (params.action) filter.action = params.action;
  if (params.resourceType) filter.resourceType = params.resourceType;
  if (params.actorType) filter.actorType = params.actorType;
  if (params.actorId) filter.actorId = params.actorId;
  if (params.search) filter.search = params.search;
  if (params.fromDate) filter.fromDate = params.fromDate;
  if (params.toDate) filter.toDate = params.toDate;
  if (params.requestId) filter.requestId = params.requestId;

  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function getAdminAuditLogs(
  params: AdminAuditLogsQueryParams,
): Promise<Paginated<AdminAuditLog>> {
  return executeQuery<{
    adminAuditLogs: {
      items: GqlAdminAuditLog[];
      pagination: Paginated<AdminAuditLog>['pagination'];
    };
  }>(ADMIN_AUDIT_LOGS_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    filter: buildAdminAuditLogFilter(params),
  }).then((data) => ({
    items: data.adminAuditLogs.items.map(mapAdminAuditLog),
    pagination: data.adminAuditLogs.pagination,
  }));
}
