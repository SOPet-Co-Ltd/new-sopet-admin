'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveCategory,
  approveTag,
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  getApprovedCategories,
  getApprovedTags,
  getCategoryDeleteImpact,
  getMyCategoryProposals,
  getMyTagProposals,
  getPendingCategories,
  getPendingTags,
  getRejectedCategories,
  getRejectedTags,
  getTagDeleteImpact,
  rejectCategory,
  rejectTag,
  setCategoryImage,
  updateCategory,
} from '@/lib/api/taxonomy';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  CreateCategoryInput,
  DeleteCategoryInput,
  SetCategoryImageInput,
  UpdateCategoryInput,
} from '@/types';

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

export function useRejectedCategories() {
  return useQuery({
    queryKey: queryKeys.taxonomy.rejectedCategories(),
    queryFn: getRejectedCategories,
  });
}

export function useRejectedTags() {
  return useQuery({
    queryKey: queryKeys.taxonomy.rejectedTags(),
    queryFn: getRejectedTags,
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

export function useCategoryDeleteImpact(categoryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.taxonomy.categoryDeleteImpact(categoryId),
    queryFn: () => getCategoryDeleteImpact(categoryId),
    enabled: enabled && !!categoryId,
  });
}

export function useTagDeleteImpact(tagId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.taxonomy.tagDeleteImpact(tagId),
    queryFn: () => getTagDeleteImpact(tagId),
    enabled: enabled && !!tagId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
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

export function useSetCategoryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetCategoryImageInput) => setCategoryImage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
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

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCategoryInput) => deleteCategory(input),
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

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
    },
  });
}
