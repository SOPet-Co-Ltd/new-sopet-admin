'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProductThumbnail } from '@/components/vendor/product-thumbnail';
import { useToast } from '@/components/ui/toast';
import { usePublishProducts } from '@/hooks/useProductMutations';
import { useVendorPublishableProducts } from '@/hooks/useVendorPublishableProducts';
import { getAllVendorPublishableProductIds } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/errors';
import { labelProductStatus } from '@/lib/i18n/th';
import { getProductListThumbnailUrl } from '@/lib/products/list-display';
import type { Product } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_LIMIT = 10;

export type VendorBatchPublishDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished?: () => void;
};

export function VendorBatchPublishDialog({
  open,
  onOpenChange,
  onPublished,
}: VendorBatchPublishDialogProps) {
  const { show } = useToast();
  const publishMutation = usePublishProducts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [failureMessages, setFailureMessages] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchCommitted, setSearchCommitted] = useState('');
  const [page, setPage] = useState(1);
  const [selectAllPending, setSelectAllPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      setSearchCommitted(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [open, searchInput]);

  const { data, isLoading, error, refetch, isFetching } = useVendorPublishableProducts(
    { search: searchCommitted || undefined, page, limit: PAGE_LIMIT },
    { enabled: open },
  );

  const products = useMemo(() => data?.items ?? [], [data?.items]);
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const selectedCount = selectedIds.size;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;
  const busy = publishMutation.isPending || selectAllPending;

  const emptyHint = useMemo(
    () =>
      searchCommitted
        ? 'ลองเปลี่ยนคำค้นหา หรือตรวจเช็คลิสต์ในหน้าแก้ไขสินค้า'
        : 'สินค้าต้องครบเช็คลิสต์การเผยแพร่ (รวมตัวเลือกการจัดส่งของร้าน) จึงจะแสดงที่นี่',
    [searchCommitted],
  );

  function toggleProduct(productId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  async function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectAllPending(true);
    setFailureMessages([]);
    try {
      const ids = await getAllVendorPublishableProductIds({
        search: searchCommitted || undefined,
      });
      setSelectedIds(new Set(ids));
    } catch (err) {
      setFailureMessages([getErrorMessage(err, 'โหลดรายการสำหรับเลือกทั้งหมดไม่สำเร็จ')]);
    } finally {
      setSelectAllPending(false);
    }
  }

  async function handlePublish() {
    if (selectedCount === 0 || busy) return;
    setFailureMessages([]);
    try {
      const result = await publishMutation.mutateAsync([...selectedIds]);
      if (result.failedCount > 0) {
        setFailureMessages(result.failures.slice(0, 3).map((failure) => failure.message));
        show(
          `เผยแพร่แล้ว ${result.publishedCount} รายการ ไม่สำเร็จ ${result.failedCount} รายการ`,
          result.publishedCount > 0 ? 'info' : 'error',
        );
      } else {
        show(`เผยแพร่แล้ว ${result.publishedCount} รายการ — กำลังแสดงรายการที่เผยแพร่`, 'success');
      }
      if (result.publishedCount > 0) {
        onPublished?.();
        handleOpenChange(false);
      }
    } catch (err) {
      setFailureMessages([getErrorMessage(err, 'เผยแพร่สินค้าไม่สำเร็จ')]);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelectedIds(new Set());
      setFailureMessages([]);
      setSearchInput('');
      setSearchCommitted('');
      setPage(1);
      setSelectAllPending(false);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4">
          <DialogTitle>เผยแพร่หลายรายการ</DialogTitle>
          <DialogDescription>
            เลือกเฉพาะสินค้าที่พร้อมเผยแพร่ — ฉบับร่างหรือเก็บถาวรที่ครบเช็คลิสต์แล้ว
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-3 px-6 py-4">
          <Input
            type="search"
            aria-label="ค้นหาสินค้าที่พร้อมเผยแพร่"
            placeholder="ค้นหาชื่อสินค้า..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          {error ? (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger-bg px-3 py-2"
              role="alert"
            >
              <p className="text-sm text-danger">
                {getErrorMessage(error, 'โหลดสินค้าที่พร้อมเผยแพร่ไม่สำเร็จ')}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                ลองอีกครั้ง
              </Button>
            </div>
          ) : null}

          {failureMessages.length > 0 ? (
            <ul
              className="space-y-1 rounded-xl border border-danger/20 bg-danger-bg px-3 py-2"
              role="alert"
            >
              {failureMessages.map((message) => (
                <li key={message} className="text-sm text-danger">
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
          {isLoading || (isFetching && products.length === 0) ? (
            <ul className="space-y-2" aria-busy="true" aria-label="กำลังโหลด">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-surface motion-reduce:animate-none"
                />
              ))}
            </ul>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <p className="font-medium text-ink">ยังไม่มีสินค้าที่พร้อมเผยแพร่</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{emptyHint}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-brand"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => void toggleSelectAll()}
                    disabled={busy || total === 0}
                    aria-label="เลือกทั้งหมด"
                  />
                  {selectAllPending ? 'กำลังเลือกทั้งหมด...' : 'เลือกทั้งหมด'}
                </label>
                <p className="text-xs text-muted-foreground">
                  แสดง {products.length} จาก {total} รายการ
                  {selectedCount > 0 ? ` · เลือกแล้ว ${selectedCount}` : ''}
                </p>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {products.map((product) => (
                  <PublishableProductRow
                    key={product.id}
                    product={product}
                    checked={selectedIds.has(product.id)}
                    disabled={busy}
                    onToggle={() => toggleProduct(product.id)}
                  />
                ))}
              </ul>
              {totalPages > 1 ? (
                <div className="flex items-center justify-between pt-1 text-sm text-muted">
                  <span>
                    หน้า {page} จาก {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || busy}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      ก่อนหน้า
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || busy}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={() => void handlePublish()}
            disabled={selectedCount === 0 || busy}
            aria-busy={publishMutation.isPending}
          >
            {publishMutation.isPending
              ? 'กำลังเผยแพร่...'
              : selectedCount > 0
                ? `เผยแพร่ ${selectedCount} รายการ`
                : 'เผยแพร่'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PublishableProductRow({
  product,
  checked,
  disabled,
  onToggle,
}: {
  product: Product;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const inputId = `batch-publish-${product.id}`;
  return (
    <li>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface/60"
      >
        <input
          id={inputId}
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-border accent-brand"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
        />
        <ProductThumbnail
          imageUrl={getProductListThumbnailUrl(product)}
          alt={product.name}
          size="sm"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {product.slug}
          </span>
        </span>
        <Badge status={product.status}>{labelProductStatus(product.status)}</Badge>
      </label>
    </li>
  );
}
