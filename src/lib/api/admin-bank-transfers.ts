import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CONFIRM_BANK_TRANSFER_PAID_MUTATION,
  PENDING_BANK_TRANSFER_ORDERS_QUERY,
} from '@/lib/graphql/documents';
import { mapPagination } from '@/lib/graphql/mappers';
import type { Paginated } from '@/types';

export type AdminBankTransferOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    storeId: string;
  }>;
};

export const ADMIN_BANK_TRANSFER_PAGE_SIZE = 20;

export function getPendingBankTransferOrders(
  page = 1,
  limit = ADMIN_BANK_TRANSFER_PAGE_SIZE,
): Promise<Paginated<AdminBankTransferOrder>> {
  return executeQuery<{
    pendingBankTransferOrders: {
      items: AdminBankTransferOrder[];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(PENDING_BANK_TRANSFER_ORDERS_QUERY, { page, limit }).then((data) => ({
    items: data.pendingBankTransferOrders.items,
    pagination: mapPagination(data.pendingBankTransferOrders.pagination),
  }));
}

export function confirmBankTransferPaid(
  orderId: string,
  note?: string,
): Promise<{ id: string; orderNumber: string; status: string }> {
  return executeMutation<{
    confirmBankTransferPaid: { id: string; orderNumber: string; status: string };
  }>(CONFIRM_BANK_TRANSFER_PAID_MUTATION, { orderId, note }).then(
    (data) => data.confirmBankTransferPaid,
  );
}
