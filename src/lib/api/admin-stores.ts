import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_QUERY,
  ADMIN_STORES_QUERY,
  CREATE_STORE_AS_ADMIN,
  LINK_STORE_OMISE_RECIPIENT_AS_ADMIN,
  UPDATE_STORE_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminStore } from '@/lib/graphql/mappers';
import type {
  AdminStore,
  AdminStoresQueryParams,
  CreateStoreAsAdminInput,
  Paginated,
  UpdateStoreAsAdminInput,
} from '@/types';
import type { AdminStoreEditFormValues, AdminStoreFormValues } from '@/lib/validations';

type GqlAdminStore = Parameters<typeof mapAdminStore>[0];

export function buildCreateStoreAsAdminInput(
  values: AdminStoreFormValues,
): CreateStoreAsAdminInput {
  return {
    ownerUserId: values.ownerId,
    name: values.name,
    description: values.description || undefined,
    contactPhone: values.contactPhone || undefined,
    contactEmail: values.contactEmail || undefined,
    address: values.address || undefined,
  };
}

export function buildUpdateStoreAsAdminInput(
  values: AdminStoreFormValues | AdminStoreEditFormValues,
  options?: { commissionRateDirty?: boolean },
): UpdateStoreAsAdminInput {
  const contactPhone = values.contactPhone?.replace(/[\s-]/g, '').trim() || null;
  const input: UpdateStoreAsAdminInput = {
    name: values.name,
    slug: values.slug?.trim() || undefined,
    description: values.description?.trim() ? values.description.trim() : null,
    status: values.status,
    contactPhone,
    contactEmail: values.contactEmail?.trim() ? values.contactEmail.trim() : null,
    address: values.address?.trim() ? values.address.trim() : null,
    ownerId: values.ownerId ? values.ownerId : null,
  };

  if (options?.commissionRateDirty === true && 'commissionRate' in values) {
    input.commissionRate = values.commissionRate;
  }

  return input;
}

export function getAdminStores(
  params: AdminStoresQueryParams = {},
): Promise<Paginated<AdminStore>> {
  return executeQuery<{
    adminStores: { items: GqlAdminStore[]; pagination: Paginated<AdminStore>['pagination'] };
  }>(ADMIN_STORES_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    search: params.search || undefined,
    status: params.status || undefined,
    sort: params.sort || undefined,
  }).then((data) => ({
    items: data.adminStores.items.map(mapAdminStore),
    pagination: data.adminStores.pagination,
  }));
}

export function getAdminStore(id: string): Promise<AdminStore> {
  return executeQuery<{ adminStore: GqlAdminStore }>(ADMIN_STORE_QUERY, { id }).then((data) =>
    mapAdminStore(data.adminStore),
  );
}

export function createStoreAsAdmin(input: CreateStoreAsAdminInput): Promise<AdminStore> {
  return executeMutation<{ createStoreAsAdmin: GqlAdminStore }>(CREATE_STORE_AS_ADMIN, {
    input,
  }).then((data) => mapAdminStore(data.createStoreAsAdmin));
}

export function updateStoreAsAdmin(
  id: string,
  input: UpdateStoreAsAdminInput,
): Promise<AdminStore> {
  return executeMutation<{ updateStoreAsAdmin: GqlAdminStore }>(UPDATE_STORE_AS_ADMIN, {
    input: { id, ...input },
  }).then((data) => mapAdminStore(data.updateStoreAsAdmin));
}

export function linkStoreOmiseRecipientAsAdmin(storeId: string): Promise<AdminStore> {
  return executeMutation<{ linkStoreOmiseRecipientAsAdmin: GqlAdminStore }>(
    LINK_STORE_OMISE_RECIPIENT_AS_ADMIN,
    { storeId },
  ).then((data) => mapAdminStore(data.linkStoreOmiseRecipientAsAdmin));
}
