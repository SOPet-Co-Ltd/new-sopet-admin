'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acknowledgeVendorOrder,
  cancelVendorOrder,
  markVendorOrderPaid,
  shipVendorOrder,
  type ShipVendorOrderInput,
} from '@/lib/api/orders';
import { queryKeys } from '@/lib/react-query/keys';

export function useMarkVendorOrderPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: true },
    mutationFn: (orderId: string) => markVendorOrderPaid(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.vendor() });
    },
  });
}

export function useAcknowledgeVendorOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: true },
    mutationFn: (orderId: string) => acknowledgeVendorOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.vendor() });
    },
  });
}

export function useShipVendorOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: true },
    mutationFn: (input: ShipVendorOrderInput) => shipVendorOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.vendor() });
    },
  });
}

export function useCancelVendorOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: true },
    mutationFn: (orderId: string) => cancelVendorOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.vendor() });
    },
  });
}
