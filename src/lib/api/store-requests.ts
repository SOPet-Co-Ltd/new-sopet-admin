import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_REQUESTS_QUERY,
  APPROVE_STORE_REQUEST,
  MY_STORE_REQUESTS_QUERY,
  PENDING_STORE_REQUEST_IDS_QUERY,
  PENDING_STORE_REQUESTS_QUERY,
  REJECT_STORE_REQUEST,
  SUBMIT_STORE_REQUEST,
} from '@/lib/graphql/documents';
import { mapStoreRequest } from '@/lib/graphql/mappers';
import type { StoreRequest, SubmitStoreRequestInput } from '@/types';

type GqlStoreRequest = Parameters<typeof mapStoreRequest>[0];

export function getMyStoreRequests(): Promise<StoreRequest[]> {
  return executeQuery<{ myStoreRequests: GqlStoreRequest[] }>(MY_STORE_REQUESTS_QUERY).then(
    (data) => data.myStoreRequests.map(mapStoreRequest),
  );
}

export function getPendingStoreRequests(): Promise<StoreRequest[]> {
  return executeQuery<{ pendingStoreRequests: GqlStoreRequest[] }>(
    PENDING_STORE_REQUESTS_QUERY,
  ).then((data) => data.pendingStoreRequests.map(mapStoreRequest));
}

export function getPendingStoreRequestIds(): Promise<Array<{ id: string }>> {
  return executeQuery<{ pendingStoreRequests: Array<{ id: string }> }>(
    PENDING_STORE_REQUEST_IDS_QUERY,
  ).then((data) => data.pendingStoreRequests);
}

/** Full history (all statuses) for the admin request center. */
export function getAdminStoreRequests(): Promise<StoreRequest[]> {
  return executeQuery<{ adminStoreRequests: GqlStoreRequest[] }>(ADMIN_STORE_REQUESTS_QUERY).then(
    (data) => data.adminStoreRequests.map(mapStoreRequest),
  );
}

export function submitStoreRequest(input: SubmitStoreRequestInput): Promise<StoreRequest> {
  return executeMutation<{ submitStoreRequest: GqlStoreRequest }>(SUBMIT_STORE_REQUEST, {
    input,
  }).then((data) => mapStoreRequest(data.submitStoreRequest));
}

export function approveStoreRequest(id: string): Promise<StoreRequest> {
  return executeMutation<{ approveStoreRequest: GqlStoreRequest }>(APPROVE_STORE_REQUEST, {
    id,
  }).then((data) => mapStoreRequest(data.approveStoreRequest));
}

export function rejectStoreRequest(id: string, reason?: string): Promise<StoreRequest> {
  return executeMutation<{ rejectStoreRequest: GqlStoreRequest }>(REJECT_STORE_REQUEST, {
    input: { id, reason: reason || undefined },
  }).then((data) => mapStoreRequest(data.rejectStoreRequest));
}
