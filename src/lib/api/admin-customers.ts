import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_CUSTOMER_ADDRESSES_QUERY,
  ADMIN_CUSTOMER_DETAIL_QUERY,
  ADMIN_CUSTOMER_QUERY,
  ADMIN_CUSTOMERS_QUERY,
  CREATE_CUSTOMER_ADDRESS_AS_ADMIN,
  DELETE_CUSTOMER_ADDRESS_AS_ADMIN,
  SET_CUSTOMER_ACTIVE,
  SET_CUSTOMER_DEFAULT_ADDRESS_AS_ADMIN,
  UPDATE_CUSTOMER_ADDRESS_AS_ADMIN,
  UPDATE_CUSTOMER_AS_ADMIN,
  VERIFY_CUSTOMER_PHONE_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminCustomer, mapAdminCustomerDetail } from '@/lib/graphql/mappers';
import type {
  AdminCustomer,
  AdminCustomerDetail,
  CreateCustomerAddressAsAdminInput,
  CustomersQueryParams,
  Paginated,
  SavedAddress,
  UpdateCustomerAddressAsAdminInput,
  UpdateCustomerAsAdminInput,
} from '@/types';

type GqlAdminCustomer = Parameters<typeof mapAdminCustomer>[0];

type GqlSavedAddress = {
  id: string;
  label?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  tumbon?: string | null;
  amphoe: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

function mapSavedAddress(address: GqlSavedAddress): SavedAddress {
  return {
    id: address.id,
    label: address.label ?? null,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? null,
    tumbon: address.tumbon ?? null,
    amphoe: address.amphoe,
    province: address.province,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

export function getAdminCustomers(params: CustomersQueryParams): Promise<Paginated<AdminCustomer>> {
  return executeQuery<{
    adminCustomers: {
      items: GqlAdminCustomer[];
      pagination: Paginated<AdminCustomer>['pagination'];
    };
  }>(ADMIN_CUSTOMERS_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    search: params.search || undefined,
  }).then((data) => ({
    items: data.adminCustomers.items.map(mapAdminCustomer),
    pagination: data.adminCustomers.pagination,
  }));
}

export function getAdminCustomer(id: string): Promise<AdminCustomer> {
  return executeQuery<{ adminCustomer: GqlAdminCustomer }>(ADMIN_CUSTOMER_QUERY, { id }).then(
    (data) => mapAdminCustomer(data.adminCustomer),
  );
}

export function getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail> {
  return executeQuery<{ adminCustomerDetail: Parameters<typeof mapAdminCustomerDetail>[0] }>(
    ADMIN_CUSTOMER_DETAIL_QUERY,
    { id },
  ).then((data) => mapAdminCustomerDetail(data.adminCustomerDetail));
}

export function updateCustomerAsAdmin(
  id: string,
  input: UpdateCustomerAsAdminInput,
): Promise<AdminCustomer> {
  return executeMutation<{ updateCustomerAsAdmin: GqlAdminCustomer }>(UPDATE_CUSTOMER_AS_ADMIN, {
    input: { id, ...input },
  }).then((data) => mapAdminCustomer(data.updateCustomerAsAdmin));
}

export function setCustomerActive(id: string, isActive: boolean): Promise<AdminCustomer> {
  return executeMutation<{ setCustomerActive: GqlAdminCustomer }>(SET_CUSTOMER_ACTIVE, {
    id,
    isActive,
  }).then((data) => mapAdminCustomer(data.setCustomerActive));
}

export function verifyCustomerPhoneAsAdmin(id: string): Promise<AdminCustomer> {
  return executeMutation<{ verifyCustomerPhoneAsAdmin: GqlAdminCustomer }>(
    VERIFY_CUSTOMER_PHONE_AS_ADMIN,
    { id },
  ).then((data) => mapAdminCustomer(data.verifyCustomerPhoneAsAdmin));
}

export function getAdminCustomerAddresses(customerId: string): Promise<SavedAddress[]> {
  return executeQuery<{ adminCustomerAddresses: GqlSavedAddress[] }>(
    ADMIN_CUSTOMER_ADDRESSES_QUERY,
    { customerId },
  ).then((data) => data.adminCustomerAddresses.map(mapSavedAddress));
}

export function createCustomerAddressAsAdmin(
  customerId: string,
  input: CreateCustomerAddressAsAdminInput,
): Promise<SavedAddress> {
  return executeMutation<{ createCustomerAddressAsAdmin: GqlSavedAddress }>(
    CREATE_CUSTOMER_ADDRESS_AS_ADMIN,
    { customerId, input },
  ).then((data) => mapSavedAddress(data.createCustomerAddressAsAdmin));
}

export function updateCustomerAddressAsAdmin(
  customerId: string,
  id: string,
  input: UpdateCustomerAddressAsAdminInput,
): Promise<SavedAddress> {
  return executeMutation<{ updateCustomerAddressAsAdmin: GqlSavedAddress }>(
    UPDATE_CUSTOMER_ADDRESS_AS_ADMIN,
    { customerId, id, input },
  ).then((data) => mapSavedAddress(data.updateCustomerAddressAsAdmin));
}

export function deleteCustomerAddressAsAdmin(customerId: string, id: string): Promise<boolean> {
  return executeMutation<{ deleteCustomerAddressAsAdmin: boolean }>(
    DELETE_CUSTOMER_ADDRESS_AS_ADMIN,
    { customerId, id },
  ).then((data) => data.deleteCustomerAddressAsAdmin);
}

export function setCustomerDefaultAddressAsAdmin(
  customerId: string,
  id: string,
): Promise<SavedAddress> {
  return executeMutation<{ setCustomerDefaultAddressAsAdmin: GqlSavedAddress }>(
    SET_CUSTOMER_DEFAULT_ADDRESS_AS_ADMIN,
    { customerId, id },
  ).then((data) => mapSavedAddress(data.setCustomerDefaultAddressAsAdmin));
}
