'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useProduct } from '@/hooks/useProduct';
import { useUpdateProductVariantStocks } from '@/hooks/useProductMutations';
import { isApiError } from '@/lib/api/errors';
import { formatCombinationLabel, parseVariantOptions } from '@/lib/variants';
import { StockPageSkeleton } from './stock-page-skeleton';
import { StockRow } from './stock-row';
import { StockSummary } from './stock-summary';
import { parseStockDraft, stockLevel } from './stock-status';

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
  const [showInvalid, setShowInvalid] = useState(false);

  if (product && product.id !== loadedProductId) {
    setLoadedProductId(product.id);
    setDraft(draftFromVariants(product.variants ?? []));
    setSaveError(null);
    setSaved(false);
    setShowInvalid(false);
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

  const inventory = useMemo(() => {
    let totalStock = 0;
    let lowCount = 0;
    let outCount = 0;
    let changedCount = 0;

    for (const row of rows) {
      const parsed = parseStockDraft(draft[row.id]);
      const qty = parsed ?? row.originalStock;
      totalStock += qty;
      const level = stockLevel(qty);
      if (level === 'low') lowCount += 1;
      if (level === 'out') outCount += 1;
      if (parsed !== null && parsed !== row.originalStock) changedCount += 1;
    }

    return { totalStock, lowCount, outCount, changedCount };
  }, [draft, rows]);

  const canSave = useMemo(() => {
    if (rows.length === 0 || stockMutation.isPending) return false;
    return rows.some((row) => {
      const next = parseStockDraft(draft[row.id]);
      return next !== null && next !== row.originalStock;
    });
  }, [draft, rows, stockMutation.isPending]);

  async function handleSave() {
    setSaveError(null);
    setSaved(false);
    const updates: Array<{ variantId: string; stockQuantity: number }> = [];

    for (const row of rows) {
      const next = parseStockDraft(draft[row.id]);
      if (next === null) {
        setShowInvalid(true);
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
    return <StockPageSkeleton />;
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
      <PageHeader
        title="แก้ไขสต็อก"
        description={`ปรับจำนวนคงเหลือของ ${product.name} โดยไม่ต้องเข้าหน้าแก้ไขสินค้า`}
        back={
          <Link
            href={`/vendor/products/${productId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายละเอียดสินค้า
          </Link>
        }
      />

      {rows.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-medium text-ink">จำนวนสต็อกตามตัวเลือก</h2>
              <p className="text-sm text-muted-foreground">
                แก้เฉพาะจำนวนคงเหลือ — สถานะและผลต่างอัปเดตทันทีเมื่อเปลี่ยนค่า
              </p>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {rows.map((row) => (
                  <StockRow
                    key={row.id}
                    id={row.id}
                    label={row.label}
                    sku={row.sku}
                    originalStock={row.originalStock}
                    draftValue={draft[row.id] ?? '0'}
                    disabled={stockMutation.isPending}
                    showInvalid={showInvalid}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        [row.id]: value,
                      }))
                    }
                  />
                ))}
              </ul>
            </CardBody>
          </Card>

          <StockSummary
            variantCount={rows.length}
            totalStock={inventory.totalStock}
            lowCount={inventory.lowCount}
            outCount={inventory.outCount}
            changedCount={inventory.changedCount}
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-display text-base font-medium text-ink">จำนวนสต็อกตามตัวเลือก</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface/50 p-4 text-sm text-muted-foreground">
              <p>ยังไม่มีตัวเลือกสินค้าสำหรับปรับสต็อก</p>
              <Link
                href={`/vendor/products/${productId}/variants`}
                className="font-medium text-secondary underline-offset-2 hover:underline"
              >
                ไปตั้งค่าตัวเลือกสินค้า
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

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

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-5 py-3.5 shadow-[var(--shadow-elevated)] backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {inventory.changedCount > 0
            ? `${inventory.changedCount} รายการรอบันทึก · สต็อกรวม ${inventory.totalStock}`
            : rows.length > 0
              ? 'ยังไม่มีการเปลี่ยนแปลงสต็อก'
              : 'ตั้งค่าตัวเลือกสินค้าก่อนปรับสต็อก'}
        </p>
        <div className="flex flex-wrap gap-3">
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
    </div>
  );
}
