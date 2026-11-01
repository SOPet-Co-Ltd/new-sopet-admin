'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_BANK_TRANSFER_PAGE_SIZE,
  confirmBankTransferPaid,
  getPendingBankTransferOrders,
} from '@/lib/api/admin-bank-transfers';
import { queryKeys } from '@/lib/react-query/keys';

export function usePendingBankTransferOrders(page = 1, limit = ADMIN_BANK_TRANSFER_PAGE_SIZE) {
  return useQuery({
    queryKey: queryKeys.bankTransfers.pending(
      page,
      limit === ADMIN_BANK_TRANSFER_PAGE_SIZE ? undefined : limit,
    ),
    queryFn: () => getPendingBankTransferOrders(page, limit),
  });
}

export function useConfirmBankTransferPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: string; note?: string }) =>
      confirmBankTransferPaid(orderId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankTransfers.all });
    },
  });
}
