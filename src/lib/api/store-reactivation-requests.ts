import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_REACTIVATION_REQUESTS_QUERY,
  APPROVE_STORE_REACTIVATION_REQUEST,
  REJECT_STORE_REACTIVATION_REQUEST,
  STORE_REACTIVATION_REQUESTS_QUERY,
  SUBMIT_STORE_REACTIVATION_REQUEST,
} from '@/lib/graphql/documents';
import { mapStoreReactivationRequest } from '@/lib/graphql/mappers';
import type { StoreReactivationRequest, SubmitStoreReactivationRequestInput } from '@/types';

type GqlStoreReactivationRequest = Parameters<typeof mapStoreReactivationRequest>[0];

export function getStoreReactivationRequests(storeId: string): Promise<StoreReactivationRequest[]> {
  return executeQuery<{ storeReactivationRequests: GqlStoreReactivationRequest[] }>(
    STORE_REACTIVATION_REQUESTS_QUERY,
    { storeId },
  ).then((data) => data.storeReactivationRequests.map(mapStoreReactivationRequest));
}

export function getAdminStoreReactivationRequests(
  status?: string,
): Promise<StoreReactivationRequest[]> {
  return executeQuery<{ adminStoreReactivationRequests: GqlStoreReactivationRequest[] }>(
    ADMIN_STORE_REACTIVATION_REQUESTS_QUERY,
    { status: status ?? null },
  ).then((data) => data.adminStoreReactivationRequests.map(mapStoreReactivationRequest));
}

export function submitStoreReactivationRequest(
  input: SubmitStoreReactivationRequestInput,
): Promise<StoreReactivationRequest> {
  return executeMutation<{ submitStoreReactivationRequest: GqlStoreReactivationRequest }>(
    SUBMIT_STORE_REACTIVATION_REQUEST,
    { input },
  ).then((data) => mapStoreReactivationRequest(data.submitStoreReactivationRequest));
}

export function approveStoreReactivationRequest(id: string): Promise<StoreReactivationRequest> {
  return executeMutation<{ approveStoreReactivationRequest: GqlStoreReactivationRequest }>(
    APPROVE_STORE_REACTIVATION_REQUEST,
    { id },
  ).then((data) => mapStoreReactivationRequest(data.approveStoreReactivationRequest));
}

export function rejectStoreReactivationRequest(
  id: string,
  reviewNote?: string,
): Promise<StoreReactivationRequest> {
  return executeMutation<{ rejectStoreReactivationRequest: GqlStoreReactivationRequest }>(
    REJECT_STORE_REACTIVATION_REQUEST,
    { input: { id, reviewNote: reviewNote ?? null } },
  ).then((data) => mapStoreReactivationRequest(data.rejectStoreReactivationRequest));
}
