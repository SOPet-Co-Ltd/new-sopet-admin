'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { ProductThumbnail } from '@/components/vendor/product-thumbnail';
import { VendorProductsActionMenu } from '@/components/vendor/vendor-products-action-menu';
import { labelProductStatus } from '@/lib/i18n/th';
import {
  getProductListPriceLabel,
  getProductListStockTotal,
  getProductListThumbnailUrl,
} from '@/lib/products/list-display';
import type { Product } from '@/types';

export interface VendorProductsMobileListProps {
  products: Product[];
  emptyState?: ReactNode;
  emptyMessage?: string;
  isDeleting?: boolean;
  petTypeNameById?: Map<string, string>;
  brandNameById?: Map<string, string>;
  onProductClick: (product: Product) => void;
  onProductPrefetch?: (product: Product) => void;
  onDelete: (productId: string) => Promise<void>;
  editPrefetchHandlers?: (
    productId: string,
  ) => Pick<HTMLAttributes<HTMLAnchorElement>, 'onMouseEnter' | 'onFocus'>;
}

export function VendorProductsMobileList({
  products,
  emptyState,
  emptyMessage = 'ไม่พบสินค้า',
  isDeleting = false,
  petTypeNameById,
  brandNameById,
  onProductClick,
  onProductPrefetch,
  onDelete,
  editPrefetchHandlers,
}: VendorProductsMobileListProps) {
  if (products.length === 0) {
    return (
      <div className="md:hidden">
        {emptyState ?? (
          <div className="rounded-xl border border-border bg-white px-4 py-10 text-center text-sm text-muted">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white md:hidden">
      {products.map((product) => {
        const petTypeName = product.petTypeId
          ? (petTypeNameById?.get(product.petTypeId) ?? '—')
          : '—';
        const brandName = product.brandId ? (brandNameById?.get(product.brandId) ?? '—') : '—';
        const tags = product.tags ?? [];
        const variantCount = product.variants?.length ?? 0;
        const stockTotal = getProductListStockTotal(product);
        const priceLabel = getProductListPriceLabel(product);

        return (
          <li key={product.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`ดูรายละเอียด ${product.name}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-surface/80 focus-visible:bg-surface/80 focus-visible:outline-none"
              onClick={() => onProductClick(product)}
              onMouseEnter={onProductPrefetch ? () => onProductPrefetch(product) : undefined}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onProductClick(product);
                }
              }}
            >
              <ProductThumbnail
                imageUrl={getProductListThumbnailUrl(product)}
                alt={product.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{product.name}</p>
                    <p className="truncate text-xs text-muted">{product.slug}</p>
                  </div>
                  <Badge status={product.status} className="mt-0.5">
                    {labelProductStatus(product.status)}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted">ราคา</dt>
                    <dd className="truncate tabular-nums text-ink">{priceLabel}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">สต็อก</dt>
                    <dd
                      className={
                        stockTotal <= 0
                          ? 'font-medium tabular-nums text-danger'
                          : 'tabular-nums text-ink'
                      }
                    >
                      {stockTotal}
                      {variantCount > 1 ? (
                        <span className="font-normal text-muted"> · {variantCount} ตัวเลือก</span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">ประเภทสัตว์</dt>
                    <dd className="truncate text-ink">{petTypeName}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">แบรนด์</dt>
                    <dd className="truncate text-ink">{brandName}</dd>
                  </div>
                  <div className="min-w-0 col-span-2">
                    <dt className="text-muted">หมวดหมู่</dt>
                    <dd className="truncate text-ink">{product.category ?? '—'}</dd>
                  </div>
                </dl>

                {tags.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 ? (
                      <span className="self-center text-xs text-muted">+{tags.length - 3}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <VendorProductsActionMenu
                productId={product.id}
                productName={product.name}
                isDeleting={isDeleting}
                editPrefetchHandlers={editPrefetchHandlers?.(product.id)}
                onDelete={async () => {
                  await onDelete(product.id);
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
