'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  createTag,
  getApprovedCategories,
  getApprovedTags,
  getMyCategoryProposals,
  getMyTagProposals,
  getPendingCategories,
  getPendingTags,
  approveCategory,
  rejectCategory,
  approveTag,
  rejectTag,
} from '@/lib/api/taxonomy';
import { queryKeys } from '@/lib/react-query/keys';

export function useApprovedCategories() {
  return useQuery({
    queryKey: queryKeys.taxonomy.approvedCategories(),
    queryFn: getApprovedCategories,
  });
}

export function useApprovedTags() {
  return useQuery({
    queryKey: queryKeys.taxonomy.approvedTags(),
    queryFn: getApprovedTags,
  });
}

export function usePendingCategories() {
  return useQuery({
    queryKey: queryKeys.taxonomy.pendingCategories(),
    queryFn: getPendingCategories,
  });
}

export function usePendingTags() {
  return useQuery({
    queryKey: queryKeys.taxonomy.pendingTags(),
    queryFn: getPendingTags,
  });
}

export function useMyCategoryProposals() {
  return useQuery({
    queryKey: queryKeys.taxonomy.myCategoryProposals(),
    queryFn: getMyCategoryProposals,
  });
}

export function useMyTagProposals() {
  return useQuery({
    queryKey: queryKeys.taxonomy.myTagProposals(),
    queryFn: getMyTagProposals,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useApproveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useRejectCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useApproveTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useRejectTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}
