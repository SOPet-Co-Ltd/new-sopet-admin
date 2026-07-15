'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { HiArrowLeft, HiShoppingBag, HiStar } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import { useProduct } from '@/hooks/useProduct';
import { useStoreProductReviews } from '@/hooks/useReviews';
import { useApprovedBrands, useApprovedPetTypes } from '@/hooks/useTaxonomy';
import { labelProductStatus } from '@/lib/i18n/th';
import { ProductDescriptionMarkdown } from '@/lib/markdown/product-description-markdown';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { variantItemsFromProduct } from '@/lib/variants';
import type { ProductStatus } from '@/types';

const LOW_STOCK_THRESHOLD = 5;
const RECENT_REVIEWS_LIMIT = 5;

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

function formatRating(value: number | undefined, reviewCount: number): string {
  if (reviewCount <= 0) return 'ยังไม่มี';
  return (value ?? 0).toFixed(1);
}

function formatPriceRange(prices: number[], fallback: number): string {
  if (prices.length === 0) return formatCurrency(fallback);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export default function VendorProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: petTypes = [] } = useApprovedPetTypes();
  const { data: brands = [] } = useApprovedBrands();
  const { data: reviewsData, isLoading: reviewsLoading } = useStoreProductReviews(
    product?.storeId,
    { page: 1, limit: 50 },
  );

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดสินค้า...</p>;
  }

  if (error || !product) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
      </p>
    );
  }

  const petTypeName = product.petTypeId
    ? (petTypes.find((item) => item.id === product.petTypeId)?.name ?? null)
    : null;
  const brandName = product.brandId
    ? (brands.find((item) => item.id === product.brandId)?.name ?? null)
    : null;
  const variants = variantItemsFromProduct(product.variants ?? []);
  const recentReviews = (reviewsData?.items ?? [])
    .filter((review) => review.productId === product.id)
    .slice(0, RECENT_REVIEWS_LIMIT);

  const images = [...(product.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const status = (product.status as ProductStatus) ?? 'draft';
  const reviewCount = product.reviewCount ?? 0;
  const soldCount = product.soldCount ?? 0;
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const variantPrices = variants.map((variant) => variant.price);
  const heroImage =
    images.find((image) => image.isThumbnail)?.imageUrl ??
    product.thumbnailUrl ??
    images[0]?.imageUrl;
  const lowStockCount = variants.filter(
    (variant) => variant.stockQuantity > 0 && variant.stockQuantity <= LOW_STOCK_THRESHOLD,
  ).length;
  const outOfStockCount = variants.filter((variant) => variant.stockQuantity <= 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="รายละเอียดสินค้า (อ่านอย่างเดียว)"
        back={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการสินค้า
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge status={status}>{labelProductStatus(status)}</Badge>
        {product.slug ? (
          <span className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-muted">
            {product.slug}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="คะแนนเฉลี่ย"
          value={formatRating(product.averageRating, reviewCount)}
          hint={reviewCount > 0 ? `จาก ${reviewCount} รีวิว` : 'ยังไม่มีรีวิว'}
          icon={<HiStar className="size-4 text-brand" aria-hidden="true" />}
        />
        <StatCard label="จำนวนรีวิว" value={reviewCount} hint="รีวิวจากลูกค้าที่ซื้อสินค้านี้" />
        <StatCard
          label="ยอดขาย"
          value={soldCount}
          hint="จำนวนชิ้นที่ขายได้"
          icon={<HiShoppingBag className="size-4 text-brand" aria-hidden="true" />}
        />
        <StatCard
          label="สต็อกรวม"
          value={variants.length > 0 ? totalStock : '—'}
          hint={
            variants.length > 0
              ? [
                  lowStockCount > 0 ? `ใกล้หมด ${lowStockCount}` : null,
                  outOfStockCount > 0 ? `หมดสต็อก ${outOfStockCount}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || `${variants.length} ตัวเลือก`
              : 'ยังไม่มีตัวเลือกสินค้า'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">รูปภาพ</h2>
            <p className="text-sm text-muted">{images.length} รูป</p>
          </CardHeader>
          <CardBody className="space-y-4">
            {heroImage ? (
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                <img
                  src={heroImage}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-surface/60 text-sm text-muted">
                ยังไม่มีรูปภาพ
              </div>
            )}
            {images.length > 1 ? (
              <ul className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                  <li
                    key={image.id}
                    className="relative overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    {image.isThumbnail ? (
                      <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1 py-0.5 text-center text-[10px] text-white">
                        หน้าปก
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {images.length === 0 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vendor/products/${product.id}/edit`}>เพิ่มรูปภาพ</Link>
              </Button>
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">ข้อมูลสินค้า</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vendor/products/${product.id}/edit`}>แก้ไขข้อมูล</Link>
              </Button>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <DetailRow label="Slug">{product.slug}</DetailRow>
              <DetailRow label="หมวดหมู่">{product.category ?? '—'}</DetailRow>
              <DetailRow label="ประเภทสัตว์เลี้ยง">{petTypeName ?? '—'}</DetailRow>
              <DetailRow label="แบรนด์">{brandName ?? '—'}</DetailRow>
              <DetailRow label="แท็ก">
                {product.tags.length > 0 ? (
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : (
                  '—'
                )}
              </DetailRow>
              <DetailRow label="วันหมดอายุ">
                {product.expiryDate
                  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
                      new Date(product.expiryDate),
                    )
                  : '—'}
              </DetailRow>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-ink">ราคา</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <DetailRow label="ราคาฐาน">{formatCurrency(product.basePrice)}</DetailRow>
              <DetailRow label="ราคาขีดฆ่า">
                {product.compareAtPrice != null ? formatCurrency(product.compareAtPrice) : '—'}
              </DetailRow>
              <DetailRow label="ช่วงราคาตัวเลือก">
                {variants.length > 0 ? formatPriceRange(variantPrices, product.basePrice) : '—'}
              </DetailRow>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-ink">รายละเอียด</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {product.description?.trim() ? (
            <ProductDescriptionMarkdown
              description={product.description}
              regionLabel="รายละเอียดสินค้า"
            />
          ) : (
            <p className="text-sm text-muted">ไม่มีรายละเอียด</p>
          )}
          {product.warning?.trim() ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="mb-1 font-medium text-ink">คำเตือน</p>
              <p className="whitespace-pre-wrap text-muted">{product.warning}</p>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              ตัวเลือกสินค้า ({variants.length})
            </h2>
            {variants.length > 0 ? (
              <p className="text-sm text-muted">
                สต็อกรวม {totalStock} · ราคา {formatPriceRange(variantPrices, product.basePrice)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor/products/${product.id}/stock`}>แก้ไขสต็อก</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor/products/${product.id}/variants`}>แก้ไขตัวเลือก</Link>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {variants.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีตัวเลือก</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="px-3 py-2 font-semibold">ตัวเลือก</th>
                    <th className="px-3 py-2 font-semibold">SKU</th>
                    <th className="px-3 py-2 font-semibold">ราคา</th>
                    <th className="px-3 py-2 font-semibold">สต็อก</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => {
                    const options = Object.entries(variant.options);
                    const isOutOfStock = variant.stockQuantity <= 0;
                    const isLowStock =
                      !isOutOfStock && variant.stockQuantity <= LOW_STOCK_THRESHOLD;
                    return (
                      <tr
                        key={variant.id ?? variant.sku}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2.5 text-ink">
                          {options.length > 0
                            ? options.map(([key, value]) => `${key}: ${value}`).join(' · ')
                            : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-muted">{variant.sku || '—'}</td>
                        <td className="px-3 py-2.5 text-ink">{formatCurrency(variant.price)}</td>
                        <td
                          className={cn(
                            'px-3 py-2.5 font-medium',
                            isOutOfStock && 'text-danger',
                            isLowStock && 'text-amber-700',
                            !isOutOfStock && !isLowStock && 'text-ink',
                          )}
                        >
                          {variant.stockQuantity}
                          {isOutOfStock ? (
                            <span className="ml-2 text-xs font-normal">หมด</span>
                          ) : null}
                          {isLowStock ? (
                            <span className="ml-2 text-xs font-normal">ใกล้หมด</span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">รีวิวล่าสุด</h2>
            <p className="text-sm text-muted">
              {reviewCount > 0
                ? `คะแนนเฉลี่ย ${formatRating(product.averageRating, reviewCount)} จาก ${reviewCount} รีวิว`
                : 'ยังไม่มีรีวิวสำหรับสินค้านี้'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/reviews">ดูรีวิวทั้งหมด</Link>
          </Button>
        </CardHeader>
        <CardBody className="space-y-3">
          {reviewsLoading ? (
            <p className="text-sm text-muted">กำลังโหลดรีวิว...</p>
          ) : recentReviews.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีรีวิวจากลูกค้า</p>
          ) : (
            recentReviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {review.customerName?.trim() || 'ลูกค้า'}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-brand">
                      <HiStar className="size-3.5" aria-hidden="true" />
                      {review.rating}/5
                    </p>
                  </div>
                  {review.createdAt ? (
                    <span className="shrink-0 text-xs text-muted">
                      {formatDateTime(review.createdAt)}
                    </span>
                  ) : null}
                </div>
                {review.comment ? (
                  <p className="mt-2 whitespace-pre-wrap text-muted">{review.comment}</p>
                ) : null}
                {review.reply?.body ? (
                  <div className="mt-3 rounded-md bg-surface/80 p-2 text-xs text-muted">
                    <p className="mb-1 font-medium text-ink">ตอบกลับจากร้าน</p>
                    <p className="whitespace-pre-wrap">{review.reply.body}</p>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
