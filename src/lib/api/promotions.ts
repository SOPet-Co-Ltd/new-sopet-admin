import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_PROMOTION,
  DELETE_PROMOTION,
  PLATFORM_PROMOTIONS_QUERY,
  TOGGLE_PROMOTION,
  UPDATE_PROMOTION,
} from '@/lib/graphql/documents';
import {
  StorePromotionsDocument,
  type StorePromotionsQuery,
} from '@/lib/graphql/generated/graphql';
import { mapPromotion } from '@/lib/graphql/mappers';
import type { CreatePromotionInput, Promotion, UpdatePromotionInput } from '@/types';

type GqlPromotion = Parameters<typeof mapPromotion>[0];

export function getStorePromotions(storeId: string): Promise<Promotion[]> {
  return executeQuery<StorePromotionsQuery>(StorePromotionsDocument, { storeId }).then((data) =>
    data.storePromotions.map(mapPromotion),
  );
}

export function getPlatformPromotions(): Promise<Promotion[]> {
  return executeQuery<{ platformPromotions: GqlPromotion[] }>(PLATFORM_PROMOTIONS_QUERY).then(
    (data) => data.platformPromotions.map(mapPromotion),
  );
}

export function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  return executeMutation<{ createPromotion: GqlPromotion }>(CREATE_PROMOTION, {
    input,
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
