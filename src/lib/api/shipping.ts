import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_CREATE_STORE_SHIPPING_OPTION,
  ADMIN_DELETE_STORE_SHIPPING_OPTION,
  ADMIN_STORE_SHIPPING_OPTIONS_QUERY,
  ADMIN_UPDATE_STORE_SHIPPING_OPTION,
  CREATE_SHIPPING_OPTION,
  CREATE_SHIPPING_PROVIDER,
  DELETE_SHIPPING_OPTION,
  DELETE_SHIPPING_PROVIDER,
  MY_STORE_SHIPPING_OPTIONS_QUERY,
  SHIPPING_PROVIDERS_QUERY,
  UPDATE_SHIPPING_OPTION,
  UPDATE_SHIPPING_PROVIDER,
} from '@/lib/graphql/documents';
import type {
  CreateShippingOptionInput,
  CreateShippingProviderInput,
  ShippingProvider,
  StoreShippingOption,
  UpdateShippingOptionInput,
  UpdateShippingProviderInput,
} from '@/types';

type GqlShippingProvider = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type GqlStoreShippingOption = {
  id: string;
  storeId: string;
  name: string;
  description?: string | null;
  price: number;
  sortOrder?: number | null;
  isActive: boolean;
  providerId?: string | null;
};

function mapShippingProvider(provider: GqlShippingProvider): ShippingProvider {
  return {
    id: provider.id,
    name: provider.name,
    isActive: provider.isActive,
    createdAt: provider.createdAt ?? undefined,
    updatedAt: provider.updatedAt ?? undefined,
  };
}

function mapStoreShippingOption(option: GqlStoreShippingOption): StoreShippingOption {
  return {
    id: option.id,
    storeId: option.storeId,
    name: option.name,
    description: option.description ?? undefined,
    price: option.price,
    sortOrder: option.sortOrder ?? undefined,
    isActive: option.isActive,
    providerId: option.providerId ?? undefined,
  };
}

export function getShippingProviders(includeInactive?: boolean): Promise<ShippingProvider[]> {
  return executeQuery<{ shippingProviders: GqlShippingProvider[] }>(SHIPPING_PROVIDERS_QUERY, {
    includeInactive: includeInactive ?? false,
  }).then((data) => data.shippingProviders.map(mapShippingProvider));
}

export function getMyStoreShippingOptions(): Promise<StoreShippingOption[]> {
  return executeQuery<{ myStoreShippingOptions: GqlStoreShippingOption[] }>(
    MY_STORE_SHIPPING_OPTIONS_QUERY,
  ).then((data) => data.myStoreShippingOptions.map(mapStoreShippingOption));
}

export function getAdminStoreShippingOptions(storeId: string): Promise<StoreShippingOption[]> {
  return executeQuery<{ adminStoreShippingOptions: GqlStoreShippingOption[] }>(
    ADMIN_STORE_SHIPPING_OPTIONS_QUERY,
    { storeId },
  ).then((data) => data.adminStoreShippingOptions.map(mapStoreShippingOption));
}

export function createShippingProvider(
  input: CreateShippingProviderInput,
): Promise<ShippingProvider> {
  return executeMutation<{ createShippingProvider: GqlShippingProvider }>(
    CREATE_SHIPPING_PROVIDER,
    { input },
  ).then((data) => mapShippingProvider(data.createShippingProvider));
}

export function updateShippingProvider(
  id: string,
  input: UpdateShippingProviderInput,
): Promise<ShippingProvider> {
  return executeMutation<{ updateShippingProvider: GqlShippingProvider }>(
    UPDATE_SHIPPING_PROVIDER,
    { id, input },
  ).then((data) => mapShippingProvider(data.updateShippingProvider));
}

export function deleteShippingProvider(id: string): Promise<boolean> {
  return executeMutation<{ deleteShippingProvider: boolean }>(DELETE_SHIPPING_PROVIDER, {
    id,
  }).then((data) => data.deleteShippingProvider);
}

export function createShippingOption(
  input: CreateShippingOptionInput,
): Promise<StoreShippingOption> {
  return executeMutation<{ createShippingOption: GqlStoreShippingOption }>(CREATE_SHIPPING_OPTION, {
    input,
  }).then((data) => mapStoreShippingOption(data.createShippingOption));
}

export function updateShippingOption(
  id: string,
  input: UpdateShippingOptionInput,
): Promise<StoreShippingOption> {
  return executeMutation<{ updateShippingOption: GqlStoreShippingOption }>(UPDATE_SHIPPING_OPTION, {
    id,
    input,
  }).then((data) => mapStoreShippingOption(data.updateShippingOption));
}

export function deleteShippingOption(id: string): Promise<boolean> {
  return executeMutation<{ deleteShippingOption: boolean }>(DELETE_SHIPPING_OPTION, {
    id,
  }).then((data) => data.deleteShippingOption);
}

export function adminCreateStoreShippingOption(
  storeId: string,
  input: CreateShippingOptionInput,
): Promise<StoreShippingOption> {
  return executeMutation<{ adminCreateStoreShippingOption: GqlStoreShippingOption }>(
    ADMIN_CREATE_STORE_SHIPPING_OPTION,
    { storeId, input },
  ).then((data) => mapStoreShippingOption(data.adminCreateStoreShippingOption));
}

export function adminUpdateStoreShippingOption(
  id: string,
  input: UpdateShippingOptionInput,
): Promise<StoreShippingOption> {
  return executeMutation<{ adminUpdateStoreShippingOption: GqlStoreShippingOption }>(
    ADMIN_UPDATE_STORE_SHIPPING_OPTION,
    { id, input },
  ).then((data) => mapStoreShippingOption(data.adminUpdateStoreShippingOption));
}

export function adminDeleteStoreShippingOption(id: string): Promise<boolean> {
  return executeMutation<{ adminDeleteStoreShippingOption: boolean }>(
    ADMIN_DELETE_STORE_SHIPPING_OPTION,
    { id },
  ).then((data) => data.adminDeleteStoreShippingOption);
}
