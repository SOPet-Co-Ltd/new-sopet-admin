'use client';

import type { HTMLAttributes } from 'react';
import { Badge } from '@/components/ui/badge';
import { VendorProductsActionMenu } from '@/components/vendor/vendor-products-action-menu';
import { labelProductStatus } from '@/lib/i18n/th';
import type { Product } from '@/types';

export interface VendorProductsMobileListProps {
  products: Product[];
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
      <div className="rounded-xl border border-border bg-white px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-card)] md:hidden">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-card)] md:hidden">
      {products.map((product) => {
        const petTypeName = product.petTypeId
          ? (petTypeNameById?.get(product.petTypeId) ?? '—')
          : '—';
        const brandName = product.brandId ? (brandNameById?.get(product.brandId) ?? '—') : '—';
        const tags = product.tags ?? [];
        const variantCount = product.variants?.length ?? 0;

        return (
          <li key={product.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`ดูรายละเอียด ${product.name}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface/80"
              onClick={() => onProductClick(product)}
              onMouseEnter={onProductPrefetch ? () => onProductPrefetch(product) : undefined}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onProductClick(product);
                }
              }}
            >
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
                    <dt className="text-muted">ประเภทสัตว์</dt>
                    <dd className="truncate text-ink">{petTypeName}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">แบรนด์</dt>
                    <dd className="truncate text-ink">{brandName}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">หมวดหมู่</dt>
                    <dd className="truncate text-ink">{product.category ?? '—'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">ตัวเลือก</dt>
                    <dd className="text-ink">{variantCount}</dd>
                  </div>
                </dl>

                {tags.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-brand-tint px-1.5 py-0.5 text-xs font-medium text-brand"
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
