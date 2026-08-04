'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { HiArrowLeft, HiStar } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-balance font-medium text-ink">{children}</h2>;
}

function Fact({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{value}</dd>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดสินค้า">
      <div className="space-y-3">
        <div className="h-4 w-36 animate-pulse rounded-md bg-surface" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-surface" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-surface" />
      </div>
      <div className="h-20 animate-pulse rounded-xl bg-surface" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="aspect-square animate-pulse rounded-xl bg-surface" />
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-surface" />
          <div className="h-28 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

function formatRating(value: number | undefined, reviewCount: number): string {
  if (reviewCount <= 0) return 'ยังไม่มี';
  return (value ?? 0).toFixed(1);
}

function formatPriceRange(prices: number[]): string {
  if (prices.length === 0) return '—';
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
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand"
        >
          <HiArrowLeft className="size-3.5" aria-hidden="true" />
          กลับไปรายการสินค้า
        </Link>
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
        </p>
      </div>
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
  const stockHint =
    variants.length > 0
      ? [
          lowStockCount > 0 ? `ใกล้หมด ${lowStockCount}` : null,
          outOfStockCount > 0 ? `หมดสต็อก ${outOfStockCount}` : null,
        ]
          .filter(Boolean)
          .join(' · ') || `${variants.length} ตัวเลือก`
      : 'ยังไม่มีตัวเลือก';
  const hasStockAlert = lowStockCount > 0 || outOfStockCount > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="รายละเอียดสินค้า (อ่านอย่างเดียว)"
        back={
          <Link
            href="/vendor/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการสินค้า
          </Link>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor/products/${product.id}/stock`}>แก้ไขสต็อก</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/vendor/products/${product.id}/edit`}>แก้ไขสินค้า</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={status}>{labelProductStatus(status)}</Badge>
            {product.slug ? (
              <span className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-muted-foreground">
                {product.slug}
              </span>
            ) : null}
            {hasStockAlert ? (
              <span className="rounded-md bg-warning-bg px-2 py-1 text-xs font-medium text-warning-text">
                {stockHint}
              </span>
            ) : null}
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Fact
              label="ราคา"
              value={variants.length > 0 ? formatPriceRange(variantPrices) : '—'}
              hint={variants.length > 0 ? 'ช่วงราคาตามตัวเลือก' : 'ยังไม่มีตัวเลือก'}
            />
            <Fact
              label="สต็อกรวม"
              value={variants.length > 0 ? totalStock : '—'}
              hint={stockHint}
            />
            <Fact label="ยอดขาย" value={soldCount} hint="จำนวนชิ้นที่ขายได้" />
            <Fact
              label="คะแนน"
              value={
                <span className="inline-flex items-center gap-1">
                  {reviewCount > 0 ? (
                    <HiStar className="size-3.5 text-brand" aria-hidden="true" />
                  ) : null}
                  {formatRating(product.averageRating, reviewCount)}
                </span>
              }
              hint={reviewCount > 0 ? `จาก ${reviewCount} รีวิว` : 'ยังไม่มีรีวิว'}
            />
          </dl>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle>รูปภาพ</SectionTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{images.length} รูป</p>
            </div>
            {images.length === 0 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vendor/products/${product.id}/edit`}>เพิ่มรูปภาพ</Link>
              </Button>
            ) : null}
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
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 text-center">
                <p className="text-sm text-muted-foreground">ยังไม่มีรูปภาพ</p>
                <p className="text-xs text-muted-foreground">
                  เพิ่มอย่างน้อย 1 รูปก่อนเผยแพร่ในหน้าร้าน
                </p>
              </div>
            )}
            {images.length > 1 ? (
              <ul className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                  <li
                    key={image.id}
                    className={cn(
                      'relative overflow-hidden rounded-md border border-border',
                      image.isThumbnail && 'ring-2 ring-brand/40',
                    )}
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    {image.isThumbnail ? (
                      <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1 py-0.5 text-center text-xs text-white">
                        หน้าปก
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <SectionTitle>ข้อมูลสินค้า</SectionTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor/products/${product.id}/edit`}>แก้ไขข้อมูล</Link>
            </Button>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
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
            <DetailRow label="ช่วงราคา">
              {variants.length > 0 ? formatPriceRange(variantPrices) : '—'}
            </DetailRow>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionTitle>รายละเอียด</SectionTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {product.description?.trim() ? (
            <ProductDescriptionMarkdown
              description={product.description}
              regionLabel="รายละเอียดสินค้า"
            />
          ) : (
            <div className="rounded-lg bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">ยังไม่มีรายละเอียดสินค้า</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`/vendor/products/${product.id}/edit`}>เพิ่มรายละเอียด</Link>
              </Button>
            </div>
          )}
          {product.warning?.trim() ? (
            <div className="rounded-lg border border-warning-text/20 bg-warning-bg p-3 text-sm">
              <p className="mb-1 font-medium text-ink">คำเตือน</p>
              <p className="whitespace-pre-wrap text-pretty text-warning-text">{product.warning}</p>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <SectionTitle>ตัวเลือกสินค้า ({variants.length})</SectionTitle>
            {variants.length > 0 ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                สต็อกรวม {totalStock} · ราคา {formatPriceRange(variantPrices)}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                ต้องมีอย่างน้อย 1 ตัวเลือกก่อนเผยแพร่
              </p>
            )}
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
            <div className="rounded-lg bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">ยังไม่มีตัวเลือกสินค้า</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`/vendor/products/${product.id}/variants`}>เพิ่มตัวเลือก</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface/60 hover:bg-surface/60">
                    <TableHead className="normal-case tracking-normal text-muted-foreground">
                      ตัวเลือก
                    </TableHead>
                    <TableHead className="normal-case tracking-normal text-muted-foreground">
                      SKU
                    </TableHead>
                    <TableHead className="normal-case tracking-normal text-muted-foreground">
                      ราคา
                    </TableHead>
                    <TableHead className="normal-case tracking-normal text-muted-foreground">
                      สต็อก
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => {
                    const options = Object.entries(variant.options);
                    const isOutOfStock = variant.stockQuantity <= 0;
                    const isLowStock =
                      !isOutOfStock && variant.stockQuantity <= LOW_STOCK_THRESHOLD;
                    return (
                      <TableRow key={variant.id ?? variant.sku}>
                        <TableCell className="font-medium text-ink">
                          {options.length > 0
                            ? options.map(([key, value]) => `${key}: ${value}`).join(' · ')
                            : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {variant.sku || '—'}
                        </TableCell>
                        <TableCell className="tabular-nums text-ink">
                          {formatCurrency(variant.price)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'font-medium tabular-nums',
                            isOutOfStock && 'text-danger',
                            isLowStock && 'text-warning-text',
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <SectionTitle>รีวิวล่าสุด</SectionTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {reviewCount > 0
                ? `คะแนนเฉลี่ย ${formatRating(product.averageRating, reviewCount)} จาก ${reviewCount} รีวิว`
                : 'ยังไม่มีรีวิวสำหรับสินค้านี้'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/reviews">ดูรีวิวทั้งหมด</Link>
          </Button>
        </CardHeader>
        <CardBody>
          {reviewsLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดรีวิว">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg bg-surface" />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีรีวิวจากลูกค้า</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {recentReviews.map((review) => (
                <li key={review.id} className="px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {review.customerName?.trim() || 'ลูกค้า'}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-brand">
                        <HiStar className="size-3.5" aria-hidden="true" />
                        <span className="tabular-nums">{review.rating}/5</span>
                      </p>
                    </div>
                    {review.createdAt ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDateTime(review.createdAt)}
                      </span>
                    ) : null}
                  </div>
                  {review.comment ? (
                    <p className="mt-2 whitespace-pre-wrap text-pretty text-muted-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                  {review.reply?.body ? (
                    <div className="mt-3 rounded-md bg-surface px-3 py-2 text-xs">
                      <p className="mb-1 font-medium text-ink">ตอบกลับจากร้าน</p>
                      <p className="whitespace-pre-wrap text-pretty text-muted-foreground">
                        {review.reply.body}
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
