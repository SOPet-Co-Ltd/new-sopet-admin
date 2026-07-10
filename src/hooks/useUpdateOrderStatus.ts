'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '@/lib/api/orders';
import { queryKeys } from '@/lib/react-query/keys';
import type { UpdateOrderStatusInput } from '@/types';

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { toastError: true },
    mutationFn: (input: UpdateOrderStatusInput) => updateOrderStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.vendorRoot() });
    },
  });
}
