import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  PRODUCT_PUBLISH_CHECKLIST_QUERY,
  PRODUCT_QUERY,
  PRODUCT_VARIANT_SYNC_IMPACT,
  PUBLISH_PRODUCT,
  PUBLISH_PRODUCTS,
  SYNC_PRODUCT_VARIANTS,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_VARIANT,
  VENDOR_PRODUCTS_QUERY,
  VENDOR_PUBLISHABLE_PRODUCTS_QUERY,
  VENDOR_PUBLISHABLE_PRODUCT_IDS_QUERY,
} from '@/lib/graphql/documents';
import { mapPagination, mapProduct } from '@/lib/graphql/mappers';
import { getErrorMessage } from '@/lib/api/errors';
import { variantItemsToSyncInput, type VariantItem } from '@/lib/variants';
import type {
  BatchPublishProductsResult,
  CreateProductInput,
  Product,
  ProductPublishChecklist,
  ProductVariantSyncImpact,
  ProductsQueryParams,
  ProductsResult,
  SyncVariantInput,
  UpdateProductInput,
} from '@/types';

/** Shared GraphQL variables for impact preview and sync — keep payloads identical. */
export function toSyncVariantGraphqlVariables(
  variants: SyncVariantInput[] | VariantItem[],
  productBasePrice = 0,
): Array<{
  id?: string;
  sku: string;
  stockQuantity: number;
  priceModifier?: number;
  compareAtPrice?: number | null;
  attributes: string;
}> {
  const payload =
    variants.length > 0 && 'options' in variants[0]
      ? variantItemsToSyncInput(variants as VariantItem[], productBasePrice)
      : (variants as SyncVariantInput[]);

  return payload.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    stockQuantity: variant.stockQuantity,
    priceModifier: variant.priceModifier,
    compareAtPrice: variant.compareAtPrice ?? null,
    attributes: JSON.stringify(variant.attributes),
  }));
}

export function getProduct(id: string): Promise<Product> {
  return executeQuery<{ vendorProduct: Parameters<typeof mapProduct>[0] }>(PRODUCT_QUERY, {
    id,
  }).then((data) => mapProduct(data.vendorProduct));
}

export function getProductPublishChecklist(productId: string): Promise<ProductPublishChecklist> {
  return executeQuery<{
    productPublishChecklist: ProductPublishChecklist;
  }>(PRODUCT_PUBLISH_CHECKLIST_QUERY, { productId }).then((data) => data.productPublishChecklist);
}

export function publishProduct(id: string): Promise<Product> {
  return executeMutation<{ publishProduct: Parameters<typeof mapProduct>[0] }>(PUBLISH_PRODUCT, {
    id,
  }).then((data) => mapProduct(data.publishProduct));
}

export function publishProducts(ids: string[]): Promise<BatchPublishProductsResult> {
  return executeMutation<{ publishProducts: BatchPublishProductsResult }>(PUBLISH_PRODUCTS, {
    ids,
  }).then((data) => data.publishProducts);
}

export function getVendorProducts(
  params: Omit<ProductsQueryParams, 'storeId'> = {},
): Promise<ProductsResult> {
  return executeQuery<{
    vendorProducts: {
      items: Parameters<typeof mapProduct>[0][];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(VENDOR_PRODUCTS_QUERY, params).then((data) => ({
    items: data.vendorProducts.items.map(mapProduct),
    pagination: mapPagination(data.vendorProducts.pagination),
  }));
}

export function getVendorPublishableProducts(
  params: { search?: string; page?: number; limit?: number } = {},
): Promise<ProductsResult> {
  return executeQuery<{
    vendorPublishableProducts: {
      items: Parameters<typeof mapProduct>[0][];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(VENDOR_PUBLISHABLE_PRODUCTS_QUERY, params).then((data) => ({
    items: data.vendorPublishableProducts.items.map(mapProduct),
    pagination: mapPagination(data.vendorPublishableProducts.pagination),
  }));
}

/** One lightweight IDs query for select-all (no product/image/variant hydration). */
export async function getAllVendorPublishableProductIds(
  params: { search?: string } = {},
): Promise<string[]> {
  const result = await executeQuery<{
    vendorPublishableProductIds: { ids: string[]; total: number };
  }>(VENDOR_PUBLISHABLE_PRODUCT_IDS_QUERY, {
    search: params.search,
  });
  return result.vendorPublishableProductIds.ids;
}

/** Smaller chunks stay under Cloudflare's 120s proxy window even on a slow origin. */
export const BATCH_PUBLISH_MAX_IDS = 10;

export type BatchPublishProgress = {
  processed: number;
  total: number;
  chunkStart: number;
  chunkEnd: number;
};

export type BatchPublishProgressCallback = (progress: BatchPublishProgress) => void;

/** Publish in chunks of BATCH_PUBLISH_MAX_IDS and merge partial-success results. */
export async function publishProductsBatched(
  ids: string[],
  onProgress?: BatchPublishProgressCallback,
): Promise<BatchPublishProductsResult> {
  const uniqueIds = [...new Set(ids)];
  const publishedIds: string[] = [];
  const failures: BatchPublishProductsResult['failures'] = [];
  const total = uniqueIds.length;

  for (let i = 0; i < uniqueIds.length; i += BATCH_PUBLISH_MAX_IDS) {
    const chunk = uniqueIds.slice(i, i + BATCH_PUBLISH_MAX_IDS);
    const chunkStart = i + 1;
    const chunkEnd = Math.min(i + chunk.length, total);
    onProgress?.({
      processed: i,
      total,
      chunkStart,
      chunkEnd,
    });

    try {
      const result = await publishProducts(chunk);
      publishedIds.push(...result.publishedIds);
      failures.push(...result.failures);
    } catch (err) {
      const message = getErrorMessage(err, 'เผยแพร่สินค้าไม่สำเร็จ');
      for (const productId of chunk) {
        failures.push({
          productId,
          code: 'CHUNK_FAILED',
          message,
        });
      }
    }

    onProgress?.({
      processed: chunkEnd,
      total,
      chunkStart,
      chunkEnd,
    });
  }

  return {
    publishedCount: publishedIds.length,
    failedCount: failures.length,
    publishedIds,
    failures,
  };
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return executeMutation<{ createProduct: Parameters<typeof mapProduct>[0] }>(CREATE_PRODUCT, {
    input,
  }).then((data) => mapProduct(data.createProduct));
}

export function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return executeMutation<{ updateProduct: Parameters<typeof mapProduct>[0] }>(UPDATE_PRODUCT, {
    id,
    input,
  }).then((data) => mapProduct(data.updateProduct));
}

export function deleteProduct(id: string): Promise<boolean> {
  return executeMutation<{ deleteProduct: boolean }>(DELETE_PRODUCT, { id }).then(
    (data) => data.deleteProduct,
  );
}

export function getProductVariantSyncImpact(
  productId: string,
  variants: SyncVariantInput[] | VariantItem[],
  productBasePrice = 0,
): Promise<ProductVariantSyncImpact> {
  return executeQuery<{ productVariantSyncImpact: ProductVariantSyncImpact }>(
    PRODUCT_VARIANT_SYNC_IMPACT,
    {
      productId,
      variants: toSyncVariantGraphqlVariables(variants, productBasePrice),
    },
  ).then((data) => data.productVariantSyncImpact);
}

export function syncProductVariants(
  productId: string,
  variants: SyncVariantInput[] | VariantItem[],
  productBasePrice = 0,
): Promise<NonNullable<Product['variants']>> {
  return executeMutation<{
    syncProductVariants: Array<{
      id: string;
      sku: string;
      price: number;
      compareAtPrice?: number | null;
      stockQuantity: number;
      optionsJson?: string | null;
    }>;
  }>(SYNC_PRODUCT_VARIANTS, {
    productId,
    variants: toSyncVariantGraphqlVariables(variants, productBasePrice),
  }).then((data) =>
    data.syncProductVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      stockQuantity: variant.stockQuantity,
      optionsJson: variant.optionsJson,
    })),
  );
}

export function updateProductVariant(
  variantId: string,
  input: { stockQuantity?: number; compareAtPrice?: number | null; priceModifier?: number },
): Promise<NonNullable<Product['variants']>[number]> {
  return executeMutation<{
    updateProductVariant: {
      id: string;
      sku: string;
      price: number;
      compareAtPrice?: number | null;
      stockQuantity: number;
      optionsJson?: string | null;
    };
  }>(UPDATE_PRODUCT_VARIANT, {
    variantId,
    input,
  }).then((data) => ({
    id: data.updateProductVariant.id,
    sku: data.updateProductVariant.sku,
    price: data.updateProductVariant.price,
    compareAtPrice: data.updateProductVariant.compareAtPrice ?? null,
    stockQuantity: data.updateProductVariant.stockQuantity,
    optionsJson: data.updateProductVariant.optionsJson,
  }));
}

export function updateProductVariantStock(
  variantId: string,
  stockQuantity: number,
): Promise<NonNullable<Product['variants']>[number]> {
  return updateProductVariant(variantId, { stockQuantity });
}
