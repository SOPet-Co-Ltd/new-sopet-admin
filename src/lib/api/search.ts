import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  SEARCH_RANKING_WEIGHTS_QUERY,
  UPDATE_SEARCH_RANKING_WEIGHTS,
  SEARCH_SYNONYMS_QUERY,
  CREATE_SEARCH_SYNONYM,
  UPDATE_SEARCH_SYNONYM,
  DELETE_SEARCH_SYNONYM,
  SEARCH_ANALYTICS_SUMMARY_QUERY,
  SEARCH_ANALYTICS_TOP_QUERIES_QUERY,
  SEARCH_ANALYTICS_ZERO_RESULT_QUERIES_QUERY,
  SEARCH_ANALYTICS_SUGGESTION_CTR_QUERY,
  EXPORT_SEARCH_ANALYTICS_CSV_QUERY,
} from '@/lib/graphql/documents';
import type {
  SearchRankingWeightsQuery,
  UpdateSearchRankingWeightsInput,
  UpdateSearchRankingWeightsMutation,
  SearchSynonymsQuery,
  CreateSearchSynonymInput,
  CreateSearchSynonymMutation,
  UpdateSearchSynonymInput,
  UpdateSearchSynonymMutation,
  SearchAnalyticsSummaryQuery,
  SearchAnalyticsTopQueriesQuery,
  SearchAnalyticsZeroResultQueriesQuery,
  SearchAnalyticsSuggestionCtrQuery,
  ExportSearchAnalyticsCsvQuery,
} from '@/lib/graphql/generated/graphql';

export type SearchRankingWeights = SearchRankingWeightsQuery['searchRankingWeights'];
export type SearchSynonym = SearchSynonymsQuery['searchSynonyms'][number];

export function getSearchRankingWeights(): Promise<SearchRankingWeights> {
  return executeQuery<SearchRankingWeightsQuery>(SEARCH_RANKING_WEIGHTS_QUERY).then(
    (data) => data.searchRankingWeights,
  );
}

export function updateSearchRankingWeights(
  input: UpdateSearchRankingWeightsInput,
): Promise<SearchRankingWeights> {
  return executeMutation<UpdateSearchRankingWeightsMutation>(UPDATE_SEARCH_RANKING_WEIGHTS, {
    input,
  }).then((data) => data.updateSearchRankingWeights);
}

export function getSearchSynonyms(): Promise<SearchSynonym[]> {
  return executeQuery<SearchSynonymsQuery>(SEARCH_SYNONYMS_QUERY).then(
    (data) => data.searchSynonyms,
  );
}

export function createSearchSynonym(input: CreateSearchSynonymInput): Promise<SearchSynonym> {
  return executeMutation<CreateSearchSynonymMutation>(CREATE_SEARCH_SYNONYM, { input }).then(
    (data) => data.createSearchSynonym,
  );
}

export function updateSearchSynonym(
  id: string,
  input: UpdateSearchSynonymInput,
): Promise<SearchSynonym> {
  return executeMutation<UpdateSearchSynonymMutation>(UPDATE_SEARCH_SYNONYM, { id, input }).then(
    (data) => data.updateSearchSynonym,
  );
}

export function deleteSearchSynonym(id: string): Promise<boolean> {
  return executeMutation<{ deleteSearchSynonym: boolean }>(DELETE_SEARCH_SYNONYM, { id }).then(
    (data) => data.deleteSearchSynonym,
  );
}

export type SearchAnalyticsSummary = SearchAnalyticsSummaryQuery['searchAnalyticsSummary'];
export type SearchAnalyticsQueryRow =
  SearchAnalyticsTopQueriesQuery['searchAnalyticsTopQueries'][number];
export type SearchSuggestionCtrRow =
  SearchAnalyticsSuggestionCtrQuery['searchAnalyticsSuggestionCtr'][number];

export function getSearchAnalyticsSummary(
  fromDate?: string,
  toDate?: string,
): Promise<SearchAnalyticsSummary> {
  return executeQuery<SearchAnalyticsSummaryQuery>(SEARCH_ANALYTICS_SUMMARY_QUERY, {
    fromDate,
    toDate,
  }).then((data) => data.searchAnalyticsSummary);
}

export function getSearchAnalyticsTopQueries(
  fromDate?: string,
  toDate?: string,
  limit = 50,
): Promise<SearchAnalyticsQueryRow[]> {
  return executeQuery<SearchAnalyticsTopQueriesQuery>(SEARCH_ANALYTICS_TOP_QUERIES_QUERY, {
    fromDate,
    toDate,
    limit,
  }).then((data) => data.searchAnalyticsTopQueries);
}

export function getSearchAnalyticsZeroResultQueries(
  fromDate?: string,
  toDate?: string,
  limit = 50,
): Promise<SearchAnalyticsQueryRow[]> {
  return executeQuery<SearchAnalyticsZeroResultQueriesQuery>(
    SEARCH_ANALYTICS_ZERO_RESULT_QUERIES_QUERY,
    { fromDate, toDate, limit },
  ).then((data) => data.searchAnalyticsZeroResultQueries);
}

export function getSearchAnalyticsSuggestionCtr(
  fromDate?: string,
  toDate?: string,
): Promise<SearchSuggestionCtrRow[]> {
  return executeQuery<SearchAnalyticsSuggestionCtrQuery>(SEARCH_ANALYTICS_SUGGESTION_CTR_QUERY, {
    fromDate,
    toDate,
  }).then((data) => data.searchAnalyticsSuggestionCtr);
}

export function exportSearchAnalyticsCsv(fromDate?: string, toDate?: string): Promise<string> {
  return executeQuery<ExportSearchAnalyticsCsvQuery>(EXPORT_SEARCH_ANALYTICS_CSV_QUERY, {
    fromDate,
    toDate,
  }).then((data) => data.exportSearchAnalyticsCsv);
}
