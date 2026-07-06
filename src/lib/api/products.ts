import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  PRODUCT_PUBLISH_CHECKLIST_QUERY,
  PRODUCT_QUERY,
  PUBLISH_PRODUCT,
  SYNC_PRODUCT_VARIANTS,
  UPDATE_PRODUCT,
  VENDOR_PRODUCTS_QUERY,
} from '@/lib/graphql/documents';
import { mapPagination, mapProduct } from '@/lib/graphql/mappers';
import { variantItemsToSyncInput, type VariantItem } from '@/lib/variants';
import type {
  CreateProductInput,
  Product,
  ProductPublishChecklist,
  ProductsQueryParams,
  ProductsResult,
  SyncVariantInput,
  UpdateProductInput,
} from '@/types';

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

export function syncProductVariants(
  productId: string,
  variants: SyncVariantInput[] | VariantItem[],
  productBasePrice = 0,
): Promise<NonNullable<Product['variants']>> {
  const payload =
    variants.length > 0 && 'options' in variants[0]
      ? variantItemsToSyncInput(variants as VariantItem[], productBasePrice)
      : (variants as SyncVariantInput[]);

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
    variants: payload.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      priceModifier: variant.priceModifier,
      attributes: JSON.stringify(variant.attributes),
    })),
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
