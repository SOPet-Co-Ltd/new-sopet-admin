'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_BANK_TRANSFER_PAGE_SIZE,
  confirmBankTransferPaid,
  getPendingBankTransferOrders,
} from '@/lib/api/admin-bank-transfers';
import { queryKeys } from '@/lib/react-query/keys';

export function usePendingBankTransferOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.bankTransfers.pending(page),
    queryFn: () => getPendingBankTransferOrders(page, ADMIN_BANK_TRANSFER_PAGE_SIZE),
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
