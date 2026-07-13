export type AuditActorType = 'admin' | 'vendor' | 'customer' | 'system';

export interface AdminAuditLog {
  id: string;
  actorType: AuditActorType;
  actorId?: string | null;
  actorLabel?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AdminAuditLogsFilter {
  action?: string;
  resourceType?: string;
  actorType?: AuditActorType;
  actorId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminAuditLogsQueryParams extends AdminAuditLogsFilter {
  page?: number;
  limit?: number;
}
