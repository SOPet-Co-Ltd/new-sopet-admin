'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSearchSynonym,
  deleteSearchSynonym,
  exportSearchAnalyticsCsv,
  getSearchAnalyticsSummary,
  getSearchAnalyticsSuggestionCtr,
  getSearchAnalyticsTopQueries,
  getSearchAnalyticsZeroResultQueries,
  getSearchRankingWeights,
  getSearchSynonyms,
  updateSearchRankingWeights,
  updateSearchSynonym,
  type SearchAnalyticsQueryRow,
  type SearchAnalyticsSummary,
  type SearchRankingWeights,
  type SearchSuggestionCtrRow,
  type SearchSynonym,
} from '@/lib/api/search';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  CreateSearchSynonymInput,
  UpdateSearchRankingWeightsInput,
  UpdateSearchSynonymInput,
} from '@/lib/graphql/generated/graphql';

export function useSearchRankingWeights() {
  return useQuery({
    queryKey: queryKeys.search.rankingWeights(),
    queryFn: getSearchRankingWeights,
  });
}

export function useUpdateSearchRankingWeights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSearchRankingWeightsInput) => updateSearchRankingWeights(input),
    onSuccess: (weights: SearchRankingWeights) => {
      queryClient.setQueryData(queryKeys.search.rankingWeights(), weights);
    },
  });
}

export function useSearchSynonyms() {
  return useQuery({
    queryKey: queryKeys.search.synonyms(),
    queryFn: getSearchSynonyms,
  });
}

export function useCreateSearchSynonym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSearchSynonymInput) => createSearchSynonym(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.synonyms() });
    },
  });
}

export function useUpdateSearchSynonym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSearchSynonymInput }) =>
      updateSearchSynonym(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.synonyms() });
    },
  });
}

export function useDeleteSearchSynonym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSearchSynonym(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.synonyms() });
    },
  });
}

export type {
  SearchSynonym,
  SearchAnalyticsSummary,
  SearchAnalyticsQueryRow,
  SearchSuggestionCtrRow,
};

export function useSearchAnalyticsSummary(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: queryKeys.search.analyticsSummary(fromDate, toDate),
    queryFn: () => getSearchAnalyticsSummary(fromDate, toDate),
  });
}

export function useSearchAnalyticsTopQueries(fromDate?: string, toDate?: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.search.analyticsTopQueries(fromDate, toDate, limit),
    queryFn: () => getSearchAnalyticsTopQueries(fromDate, toDate, limit),
    placeholderData: keepPreviousData,
  });
}

export function useSearchAnalyticsZeroResultQueries(
  fromDate?: string,
  toDate?: string,
  limit = 10,
) {
  return useQuery({
    queryKey: queryKeys.search.analyticsZeroResultQueries(fromDate, toDate, limit),
    queryFn: () => getSearchAnalyticsZeroResultQueries(fromDate, toDate, limit),
    placeholderData: keepPreviousData,
  });
}

export function useSearchAnalyticsSuggestionCtr(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: queryKeys.search.analyticsSuggestionCtr(fromDate, toDate),
    queryFn: () => getSearchAnalyticsSuggestionCtr(fromDate, toDate),
  });
}

export function useExportSearchAnalyticsCsv() {
  return useMutation({
    mutationFn: ({ fromDate, toDate }: { fromDate?: string; toDate?: string }) =>
      exportSearchAnalyticsCsv(fromDate, toDate),
  });
}
