import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVE_STORE,
  MY_STORE_QUERY,
  MY_STORES_QUERY,
  PENDING_STORES_QUERY,
  REJECT_STORE,
  STORE_DETAIL_QUERY,
  STORE_QUERY,
  STORES_QUERY,
  SWITCH_STORE,
  UPDATE_STORE,
  UPDATE_STORE_PAYOUT,
} from '@/lib/graphql/documents';
import { mapStore, mapUser } from '@/lib/graphql/mappers';
import type {
  LoginResult,
  OmiseRecipientStatus,
  RejectStoreInput,
  Store,
  StoreDetail,
  UpdateStoreInput,
  VendorStore,
} from '@/types';

type GqlStoreDetail = Parameters<typeof mapStore>[0] & {
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  omiseRecipientId?: string | null;
  omiseRecipientStatus?: string | null;
  omiseRecipientFailureMessage?: string | null;
};

function mapStoreDetail(store: GqlStoreDetail): StoreDetail {
  return {
    ...mapStore(store),
    contactPhone: store.contactPhone ?? undefined,
    contactEmail: store.contactEmail ?? undefined,
    address: store.address ?? undefined,
    bankAccountName: store.bankAccountName ?? undefined,
    bankAccountNumber: store.bankAccountNumber ?? undefined,
    bankName: store.bankName ?? undefined,
    bankCode: store.bankCode ?? undefined,
    omiseRecipientId: store.omiseRecipientId ?? undefined,
    omiseRecipientStatus: (store.omiseRecipientStatus as OmiseRecipientStatus | null) ?? undefined,
    omiseRecipientFailureMessage: store.omiseRecipientFailureMessage ?? undefined,
  };
}

export function getPendingStores(): Promise<Store[]> {
  return executeQuery<{ pendingStores: Parameters<typeof mapStore>[0][] }>(
    PENDING_STORES_QUERY,
  ).then((data) => data.pendingStores.map(mapStore));
}

export function getStores(): Promise<Store[]> {
  return executeQuery<{ stores: Parameters<typeof mapStore>[0][] }>(STORES_QUERY).then((data) =>
    data.stores.map(mapStore),
  );
}

export function getStore(id: string): Promise<Store> {
  return executeQuery<{ store: Parameters<typeof mapStore>[0] }>(STORE_QUERY, {
    id,
  }).then((data) => mapStore(data.store));
}

export function getStoreDetail(id: string): Promise<StoreDetail> {
  return executeQuery<{ store: GqlStoreDetail }>(STORE_DETAIL_QUERY, { id }).then((data) =>
    mapStoreDetail(data.store),
  );
}

export function getMyStore(): Promise<StoreDetail> {
  return executeQuery<{ myStore: GqlStoreDetail }>(MY_STORE_QUERY).then((data) =>
    mapStoreDetail(data.myStore),
  );
}

export function updateStore(input: UpdateStoreInput): Promise<StoreDetail> {
  return executeMutation<{ updateStore: GqlStoreDetail }>(UPDATE_STORE, { input }).then((data) =>
    mapStoreDetail(data.updateStore),
  );
}

export function updateStorePayout(
  input: Pick<UpdateStoreInput, 'bankAccountName' | 'bankAccountNumber' | 'bankName' | 'bankCode'>,
): Promise<StoreDetail> {
  return executeMutation<{ updateStorePayout: GqlStoreDetail }>(UPDATE_STORE_PAYOUT, {
    input,
  }).then((data) => mapStoreDetail(data.updateStorePayout));
}

export function approveStore(storeId: string): Promise<Store> {
  return executeMutation<{ approveStore: Parameters<typeof mapStore>[0] }>(APPROVE_STORE, {
    input: { storeId },
  }).then((data) => mapStore(data.approveStore));
}

export function rejectStore(input: RejectStoreInput): Promise<Store> {
  return executeMutation<{ rejectStore: Parameters<typeof mapStore>[0] }>(REJECT_STORE, {
    input,
  }).then((data) => mapStore(data.rejectStore));
}

export function getMyStores(): Promise<VendorStore[]> {
  return executeQuery<{
    myStores: Array<{
      membershipRole: string;
      store: Parameters<typeof mapStore>[0];
    }>;
  }>(MY_STORES_QUERY).then((data) =>
    data.myStores.map((entry) => ({
      membershipRole: entry.membershipRole,
      store: mapStore(entry.store),
    })),
  );
}

export function switchStore(storeId: string): Promise<LoginResult> {
  return executeMutation<{
    switchStore: {
      tokens: { accessToken: string; refreshToken: string };
      user: Parameters<typeof mapUser>[0] & { storeId?: string | null };
    };
  }>(SWITCH_STORE, { input: { storeId } }).then((data) => ({
    accessToken: data.switchStore.tokens.accessToken,
    refreshToken: data.switchStore.tokens.refreshToken,
    user: mapUser(data.switchStore.user, data.switchStore.user.storeId ?? storeId),
  }));
}
