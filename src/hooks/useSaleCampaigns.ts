'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSaleCampaign,
  deleteSaleCampaign,
  getStoreSaleCampaigns,
  toggleSaleCampaign,
  updateSaleCampaign,
} from '@/lib/api/sale-campaigns';
import { queryKeys } from '@/lib/react-query/keys';
import type { CreateSaleCampaignInput, UpdateSaleCampaignInput } from '@/types';

export function useStoreSaleCampaigns(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.saleCampaigns.store(storeId ?? ''),
    queryFn: () => getStoreSaleCampaigns(storeId!),
    enabled: !!storeId,
  });
}

export function useStoreSaleCampaign(id: string, storeId?: string) {
  const query = useStoreSaleCampaigns(storeId);
  const campaign = query.data?.find((item) => item.id === id);
  return {
    ...query,
    data: campaign,
    isNotFound: !!storeId && !query.isLoading && !query.error && !campaign,
  };
}

export function useCreateSaleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleCampaignInput) => createSaleCampaign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleCampaigns.all });
    },
  });
}

export function useUpdateSaleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSaleCampaignInput }) =>
      updateSaleCampaign(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleCampaigns.all });
    },
  });
}

export function useDeleteSaleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSaleCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleCampaigns.all });
    },
  });
}

export function useToggleSaleCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleSaleCampaign(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleCampaigns.all });
    },
  });
}
