'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { VendorProductFilters } from '@/components/vendor/vendor-product-filters';
import { VendorProductsActionMenu } from '@/components/vendor/vendor-products-action-menu';
import { VendorProductsMobileList } from '@/components/vendor/vendor-products-mobile-list';
import { useDeleteProduct } from '@/hooks/useProductMutations';
import {
  useApprovedBrands,
  useApprovedCategories,
  useApprovedPetTypes,
  useApprovedTags,
} from '@/hooks/useTaxonomy';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import {
  createDetailPrefetchHandlers,
  prefetchVendorProductDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { labelProductStatus } from '@/lib/i18n/th';
import type { Product } from '@/types';

const ALL = 'all';

export default function VendorProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(ALL);
  const [petTypeId, setPetTypeId] = useState(ALL);
  const [brandId, setBrandId] = useState(ALL);
  const [tagId, setTagId] = useState(ALL);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useApprovedCategories();
  const { data: petTypes = [] } = useApprovedPetTypes();
  const { data: brands = [] } = useApprovedBrands();
  const { data: tags = [] } = useApprovedTags();

  // The vendorProducts GraphQL query resolves `category` by slug/name (not id),
  // so the selected category id is mapped to its slug before filtering.
  const categorySlugById = useMemo(
    () => new Map(categories.map((item) => [item.id, item.slug])),
    [categories],
  );

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      category: categoryId !== ALL ? categorySlugById.get(categoryId) : undefined,
      petTypeIds: petTypeId !== ALL ? [petTypeId] : undefined,
      brandIds: brandId !== ALL ? [brandId] : undefined,
      tag: tagId !== ALL ? tagId : undefined,
      page,
      limit: 10,
    }),
    [search, categoryId, categorySlugById, petTypeId, brandId, tagId, page],
  );

  const { data, isLoading, error } = useVendorProducts(queryParams);
  const deleteMutation = useDeleteProduct();

  const petTypeNameById = useMemo(
    () => new Map(petTypes.map((item) => [item.id, item.name])),
    [petTypes],
  );
  const brandNameById = useMemo(
    () => new Map(brands.map((item) => [item.id, item.name])),
    [brands],
  );

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>สินค้า</SortableHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.name}</p>
            <p className="text-xs text-muted">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'petType',
        header: 'ประเภทสัตว์',
        cell: ({ row }) =>
          row.original.petTypeId ? (petTypeNameById.get(row.original.petTypeId) ?? '—') : '—',
        meta: { className: 'hidden lg:table-cell' },
      },
      {
        id: 'brand',
        header: 'แบรนด์',
        cell: ({ row }) =>
          row.original.brandId ? (brandNameById.get(row.original.brandId) ?? '—') : '—',
        meta: { className: 'hidden lg:table-cell' },
      },
      {
        id: 'tags',
        header: 'แท็ก',
        cell: ({ row }) => {
          const productTags = row.original.tags ?? [];
          if (productTags.length === 0) {
            return <span className="text-muted">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {productTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-brand-tint px-1.5 py-0.5 text-xs font-medium text-brand"
                >
                  {tag}
                </span>
              ))}
              {productTags.length > 3 ? (
                <span className="text-xs text-muted">+{productTags.length - 3}</span>
              ) : null}
            </div>
          );
        },
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'variants',
        header: 'ตัวเลือก',
        cell: ({ row }) => (
          <span className="text-sm text-muted">{row.original.variants?.length ?? 0}</span>
        ),
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.status}>{labelProductStatus(row.original.status)}</Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: 'หมวดหมู่',
        cell: ({ row }) => row.original.category ?? '—',
        meta: { className: 'hidden xl:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <VendorProductsActionMenu
            productId={row.original.id}
            productName={row.original.name}
            isDeleting={deleteMutation.isPending}
            editPrefetchHandlers={createDetailPrefetchHandlers(() =>
              prefetchVendorProductDetail(queryClient, row.original.id),
            )}
            onDelete={async () => {
              await deleteMutation.mutateAsync(row.original.id);
            }}
          />
        ),
      },
    ],
    [brandNameById, deleteMutation, petTypeNameById, queryClient],
  );

  const pagination = data?.pagination;
  const products = data?.items ?? [];

  const resetPage = () => setPage(1);

  return (
    <div>
      <PageHeader
        title="สินค้า"
        description="ดูและจัดการสินค้าในร้าน กรองตามหมวดหมู่ ประเภทสัตว์เลี้ยง แบรนด์ และแท็ก"
        action={
          <Button asChild>
            <Link href="/vendor/products/new">เพิ่มสินค้า</Link>
          </Button>
        }
      />

      <div className="mb-6">
        <VendorProductFilters
          leading={
            <Input
              type="search"
              aria-label="ค้นหาสินค้า"
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          }
          categoryId={categoryId}
          petTypeId={petTypeId}
          brandId={brandId}
          tagId={tagId}
          categories={categories}
          petTypes={petTypes}
          brands={brands}
          tags={tags}
          onCategoryChange={(value) => {
            setCategoryId(value);
            resetPage();
          }}
          onPetTypeChange={(value) => {
            setPetTypeId(value);
            resetPage();
          }}
          onBrandChange={(value) => {
            setBrandId(value);
            resetPage();
          }}
          onTagChange={(value) => {
            setTagId(value);
            resetPage();
          }}
        />
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลดสินค้า...</p> : null}
      {error ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'โหลดสินค้าไม่สำเร็จ'}
        </p>
      ) : null}
      {deleteMutation.error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'ลบสินค้าไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <VendorProductsMobileList
            products={products}
            emptyMessage="ไม่พบสินค้า"
            isDeleting={deleteMutation.isPending}
            petTypeNameById={petTypeNameById}
            brandNameById={brandNameById}
            onProductClick={(product) => router.push(`/vendor/products/${product.id}`)}
            onProductPrefetch={(product) => prefetchVendorProductDetail(queryClient, product.id)}
            editPrefetchHandlers={(productId) =>
              createDetailPrefetchHandlers(() =>
                prefetchVendorProductDetail(queryClient, productId),
              )
            }
            onDelete={async (productId) => {
              await deleteMutation.mutateAsync(productId);
            }}
          />
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={products}
              emptyMessage="ไม่พบสินค้า"
              onRowClick={(product) => router.push(`/vendor/products/${product.id}`)}
              onRowMouseEnter={(product) => prefetchVendorProductDetail(queryClient, product.id)}
            />
          </div>
          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>
                หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total}{' '}
                รายการ)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
