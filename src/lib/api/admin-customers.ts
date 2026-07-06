import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_CUSTOMER_QUERY,
  ADMIN_CUSTOMERS_QUERY,
  SET_CUSTOMER_ACTIVE,
  UPDATE_CUSTOMER_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminCustomer } from '@/lib/graphql/mappers';
import type {
  AdminCustomer,
  CustomersQueryParams,
  Paginated,
  UpdateCustomerAsAdminInput,
} from '@/types';

type GqlAdminCustomer = Parameters<typeof mapAdminCustomer>[0];

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
