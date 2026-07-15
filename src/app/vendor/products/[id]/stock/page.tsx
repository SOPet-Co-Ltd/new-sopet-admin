'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProduct } from '@/hooks/useProduct';
import { useUpdateProductVariantStocks } from '@/hooks/useProductMutations';
import { isApiError } from '@/lib/api/errors';
import { formatCombinationLabel, parseVariantOptions } from '@/lib/variants';

function draftFromVariants(
  variants: Array<{ id: string; stockQuantity: number }>,
): Record<string, string> {
  return Object.fromEntries(variants.map((variant) => [variant.id, String(variant.stockQuantity)]));
}

export default function ProductStockPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(productId);
  const stockMutation = useUpdateProductVariantStocks();

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (product && product.id !== loadedProductId) {
    setLoadedProductId(product.id);
    setDraft(draftFromVariants(product.variants ?? []));
    setSaveError(null);
    setSaved(false);
  }

  const rows = useMemo(() => {
    const productVariants = product?.variants ?? [];
    return productVariants.map((variant) => {
      const options = parseVariantOptions(variant.optionsJson);
      const label = formatCombinationLabel(options);
      return {
        id: variant.id,
        sku: variant.sku,
        label: label || variant.sku,
        originalStock: variant.stockQuantity,
      };
    });
  }, [product?.variants]);

  const canSave = useMemo(() => {
    if (rows.length === 0 || stockMutation.isPending) return false;
    return rows.some((row) => {
      const next = Number(draft[row.id]);
      return Number.isInteger(next) && next >= 0 && next !== row.originalStock;
    });
  }, [draft, rows, stockMutation.isPending]);

  async function handleSave() {
    setSaveError(null);
    setSaved(false);
    const updates: Array<{ variantId: string; stockQuantity: number }> = [];

    for (const row of rows) {
      const raw = draft[row.id]?.trim() ?? '';
      const next = Number(raw);
      if (!Number.isInteger(next) || next < 0) {
        setSaveError('กรุณาระบุจำนวนสต็อกเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป');
        return;
      }
      if (next !== row.originalStock) {
        updates.push({ variantId: row.id, stockQuantity: next });
      }
    }

    if (updates.length === 0) {
      router.push(`/vendor/products/${productId}`);
      return;
    }

    try {
      await stockMutation.mutateAsync({ productId, updates });
      setSaved(true);
      router.push(`/vendor/products/${productId}`);
    } catch (err) {
      setSaveError(isApiError(err) ? err.message : 'บันทึกสต็อกไม่สำเร็จ');
    }
  }

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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/vendor/products/${productId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <HiArrowLeft className="size-4" aria-hidden="true" />
          กลับไปรายละเอียดสินค้า
        </Link>
        <PageHeader
          title="แก้ไขสต็อก"
          description={`ปรับจำนวนสต็อกของ ${product.name} โดยไม่ต้องเข้าหน้าแก้ไขสินค้า`}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink">จำนวนสต็อกตามตัวเลือก</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {rows.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface/50 p-4 text-sm text-muted">
              <p>ยังไม่มีตัวเลือกสินค้าสำหรับปรับสต็อก</p>
              <Link
                href={`/vendor/products/${productId}/variants`}
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                ไปตั้งค่าตัวเลือกสินค้า
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-end"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.label}</p>
                    <p className="truncate text-xs text-muted">SKU: {row.sku}</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`stock-${row.id}`}>จำนวนสต็อก</Label>
                    <Input
                      id={`stock-${row.id}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={draft[row.id] ?? '0'}
                      disabled={stockMutation.isPending}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [row.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {saveError ? (
        <p className="text-sm text-danger" role="alert">
          {saveError}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-success" role="status">
          บันทึกสต็อกแล้ว
        </p>
      ) : null}

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={`/vendor/products/${productId}`}>ยกเลิก</Link>
        </Button>
        <Button
          type="button"
          disabled={!canSave}
          aria-busy={stockMutation.isPending}
          onClick={() => {
            void handleSave();
          }}
        >
          {stockMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกสต็อก'}
        </Button>
      </div>
    </div>
  );
}
