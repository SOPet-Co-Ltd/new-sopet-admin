import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_PROMOTION,
  DELETE_PROMOTION,
  PLATFORM_PROMOTIONS_QUERY,
  PROMOTION_QUERY,
  TOGGLE_PROMOTION,
  UPDATE_PROMOTION,
} from '@/lib/graphql/documents';
import {
  StorePromotionsDocument,
  type StorePromotionsQuery,
} from '@/lib/graphql/generated/graphql';
import { mapPromotion } from '@/lib/graphql/mappers';
import type {
  CreatePromotionInput,
  Paginated,
  Promotion,
  PromotionsQueryParams,
  UpdatePromotionInput,
} from '@/types';

type GqlPromotion = Parameters<typeof mapPromotion>[0];

/** Backend CreatePromotionInput has no `scope` — role derives it. Strip if callers still pass it. */
function toCreatePromotionVariables(
  input: CreatePromotionInput & { scope?: unknown },
): CreatePromotionInput {
  const { scope, ...rest } = input;
  void scope;
  return rest;
}

export function getPromotion(id: string): Promise<Promotion> {
  return executeQuery<{ promotion: GqlPromotion }>(PROMOTION_QUERY, { id }).then((data) =>
    mapPromotion(data.promotion),
  );
}

export function getStorePromotions(
  storeId: string,
  params: PromotionsQueryParams = {},
): Promise<Paginated<Promotion>> {
  return executeQuery<StorePromotionsQuery>(StorePromotionsDocument, {
    storeId,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  }).then((data) => ({
    items: data.storePromotions.items.map(mapPromotion),
    pagination: data.storePromotions.pagination,
  }));
}

export function getPlatformPromotions(
  params: PromotionsQueryParams = {},
): Promise<Paginated<Promotion>> {
  return executeQuery<{
    platformPromotions: { items: GqlPromotion[]; pagination: Paginated<Promotion>['pagination'] };
  }>(PLATFORM_PROMOTIONS_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  }).then((data) => ({
    items: data.platformPromotions.items.map(mapPromotion),
    pagination: data.platformPromotions.pagination,
  }));
}

export function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  return executeMutation<{ createPromotion: GqlPromotion }>(CREATE_PROMOTION, {
    input: toCreatePromotionVariables(input),
  }).then((data) => mapPromotion(data.createPromotion));
}

export function updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion> {
  return executeMutation<{ updatePromotion: GqlPromotion }>(UPDATE_PROMOTION, {
    id,
    input,
  }).then((data) => mapPromotion(data.updatePromotion));
}

export function deletePromotion(id: string): Promise<boolean> {
  return executeMutation<{ deletePromotion: boolean }>(DELETE_PROMOTION, { id }).then(
    (data) => data.deletePromotion,
  );
}

export function togglePromotion(id: string, isActive: boolean): Promise<Promotion> {
  return executeMutation<{ togglePromotion: GqlPromotion }>(TOGGLE_PROMOTION, {
    id,
    isActive,
  }).then((data) => mapPromotion(data.togglePromotion));
}
