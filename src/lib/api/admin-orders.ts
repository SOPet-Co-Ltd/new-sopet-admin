import { executeQuery } from '@/lib/graphql/client';
import { ADMIN_ORDER_QUERY, ADMIN_ORDERS_QUERY } from '@/lib/graphql/documents';
import { mapOrder, mapPagination } from '@/lib/graphql/mappers';
import type { Order, Paginated } from '@/types';

export type AdminOrderStore = {
  id: string;
  name: string;
};

export type AdminOrderCustomer = {
  id: string;
  fullName: string | null;
  phone: string;
  email: string | null;
};

export type AdminOrder = {
  order: Order;
  stores: AdminOrderStore[];
  customer: AdminOrderCustomer | null;
};

export const ADMIN_ORDERS_PAGE_SIZE = 20;

type GqlAdminOrder = {
  order: Parameters<typeof mapOrder>[0];
  stores: AdminOrderStore[];
  customer: AdminOrderCustomer | null;
};

function mapAdminOrder(record: GqlAdminOrder): AdminOrder {
  return {
    order: mapOrder(record.order),
    stores: record.stores,
    customer: record.customer,
  };
}

export function getAdminOrders(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<Paginated<AdminOrder>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? ADMIN_ORDERS_PAGE_SIZE;

  return executeQuery<{
    adminOrders: {
      items: GqlAdminOrder[];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(ADMIN_ORDERS_QUERY, {
    page,
    limit,
    search: params.search || undefined,
    status: params.status || undefined,
  }).then((data) => ({
    items: data.adminOrders.items.map(mapAdminOrder),
    pagination: mapPagination(data.adminOrders.pagination),
  }));
}

export function getAdminOrder(id: string): Promise<AdminOrder> {
  return executeQuery<{ adminOrder: GqlAdminOrder }>(ADMIN_ORDER_QUERY, { id }).then((data) =>
    mapAdminOrder(data.adminOrder),
  );
}
