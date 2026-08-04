import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  PRODUCT_PUBLISH_CHECKLIST_QUERY,
  PRODUCT_QUERY,
  PRODUCT_VARIANT_SYNC_IMPACT,
  PUBLISH_PRODUCT,
  SYNC_PRODUCT_VARIANTS,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_VARIANT,
  VENDOR_PRODUCTS_QUERY,
} from '@/lib/graphql/documents';
import { mapPagination, mapProduct } from '@/lib/graphql/mappers';
import { variantItemsToSyncInput, type VariantItem } from '@/lib/variants';
import type {
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
      stockQuantity: variant.stockQuantity,
      optionsJson: variant.optionsJson,
    })),
  );
}

export function updateProductVariantStock(
  variantId: string,
  stockQuantity: number,
): Promise<NonNullable<Product['variants']>[number]> {
  return executeMutation<{
    updateProductVariant: {
      id: string;
      sku: string;
      price: number;
      stockQuantity: number;
      optionsJson?: string | null;
    };
  }>(UPDATE_PRODUCT_VARIANT, {
    variantId,
    input: { stockQuantity },
  }).then((data) => ({
    id: data.updateProductVariant.id,
    sku: data.updateProductVariant.sku,
    price: data.updateProductVariant.price,
    stockQuantity: data.updateProductVariant.stockQuantity,
    optionsJson: data.updateProductVariant.optionsJson,
  }));
}
