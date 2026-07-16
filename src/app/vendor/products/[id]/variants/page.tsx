'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiArrowLeft, HiArrowPath } from 'react-icons/hi2';
import { VariantItemsSpreadsheet } from '@/components/vendor/variant-items-spreadsheet';
import { VariantOptionGroupsEditor } from '@/components/vendor/variant-option-groups-editor';
import { VariantSyncImpactDialog } from '@/components/vendor/variant-sync-impact-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { useProduct } from '@/hooks/useProduct';
import { PRODUCT_WIZARD_STEPS } from '@/lib/product-wizard';
import { cn, formatCurrency } from '@/lib/utils';
import {
  buildCombinationsFromGroups,
  extractOptionGroups,
  variantItemsFromProduct,
  variantOptionKey,
  type VariantItem,
  type VariantOptionGroup,
} from '@/lib/variants';

const WIZARD_STEP_NUMBER = PRODUCT_WIZARD_STEPS.length;

function normalizeGroups(groups: VariantOptionGroup[]): VariantOptionGroup[] {
  return groups
    .map((group) => ({
      name: group.name.trim(),
      values: [...new Set(group.values.map((value) => value.trim()).filter(Boolean))],
    }))
    .filter((group) => group.name && group.values.length > 0);
}

function optionKeySet(items: VariantItem[]): Set<string> {
  return new Set(items.map((item) => variantOptionKey(item.options)));
}

function formatPriceRange(prices: number[]): string {
  if (prices.length === 0) return '—';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

function VariantsPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <p className="sr-only">กำลังโหลดสินค้า...</p>
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-surface motion-reduce:animate-none" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="h-52 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
          <div className="h-72 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
        </div>
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
          <div className="h-36 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

export default function ProductVariantsPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromWizard = searchParams.get('fromWizard') === '1';
  const { data: product, isLoading, error } = useProduct(productId);

  const [items, setItems] = useState<VariantItem[]>([]);
  const [groups, setGroups] = useState<VariantOptionGroup[]>([]);
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const [impactOpen, setImpactOpen] = useState(false);

  if (product && product.id !== loadedProductId) {
    setLoadedProductId(product.id);
    const initialItems = variantItemsFromProduct(product.variants ?? []);
    setItems(initialItems);
    setGroups(extractOptionGroups(initialItems));
  }

  const pendingCombinations = useMemo(() => {
    const normalized = normalizeGroups(groups);
    // Empty option groups → no SKU grid (avoids a phantom empty combo).
    if (normalized.length === 0) return [];
    return buildCombinationsFromGroups(normalized, items, product?.slug ?? 'sku');
  }, [groups, items, product?.slug]);

  const outOfSync = useMemo(() => {
    const currentKeys = optionKeySet(items);
    const pendingKeys = optionKeySet(pendingCombinations);
    if (currentKeys.size !== pendingKeys.size) return true;
    for (const key of currentKeys) {
      if (!pendingKeys.has(key)) return true;
    }
    return false;
  }, [items, pendingCombinations]);

  function handleApplyGroups() {
    setItems(pendingCombinations);
  }

  function handleSave() {
    if (!product) return;
    setImpactOpen(true);
  }

  function handleSyncSuccess() {
    if (!product) return;
    router.push(`/vendor/products/${product.id}`);
  }

  if (isLoading) {
    return <VariantsPageSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="rounded-xl border border-border bg-danger-bg/40 p-6" role="alert">
        <p className="text-sm font-medium text-danger">
          {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
        </p>
        <Link
          href="/vendor/products"
          className="mt-3 inline-flex text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          กลับไปรายการสินค้า
        </Link>
      </div>
    );
  }

  const totalStock = items.reduce((sum, item) => sum + item.stockQuantity, 0);
  const outOfStockCount = items.filter((item) => item.stockQuantity <= 0).length;
  const priceRange = formatPriceRange(items.map((item) => item.price));
  const canSave = items.length > 0 && !outOfSync;

  return (
    <div>
      <PageHeader
        title={product.name}
        description={
          isFromWizard
            ? `ขั้นที่ ${WIZARD_STEP_NUMBER} จาก ${WIZARD_STEP_NUMBER} — ${PRODUCT_WIZARD_STEPS[WIZARD_STEP_NUMBER - 1].label} · ยังปรับตัวเลือกที่ตั้งไว้ก่อนหน้าได้ที่นี่`
            : 'จัดการตัวเลือกสินค้า เพิ่ม แก้ไข หรือลบ SKU สต็อก และราคาได้อย่างอิสระ'
        }
        back={
          <Link
            href={`/vendor/products/${product.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายละเอียดสินค้า
          </Link>
        }
      />

      {isFromWizard ? (
        <Stepper steps={PRODUCT_WIZARD_STEPS} currentStep={WIZARD_STEP_NUMBER} className="mb-8" />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6 lg:order-1">
          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-medium text-ink text-balance">
                กลุ่มตัวเลือกสินค้า
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                เพิ่ม แก้ไข หรือลบตัวเลือกได้ทุกเมื่อ — ระบบจับคู่ SKU สต็อก
                และราคาเดิมเมื่อค่าตรงกัน
              </p>
            </CardHeader>
            <CardBody className="space-y-4">
              <VariantOptionGroupsEditor
                groups={groups}
                onChange={setGroups}
                helperText="เช่น สี → แดง, น้ำเงิน, เขียว · ไซส์ → xs, s, m, l, xl · แก้ชื่อหรือค่าที่มีอยู่ได้โดยตรง"
              />

              {outOfSync ? (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--warning-text)_28%,var(--border))] bg-warning-bg/80 p-3"
                  role="status"
                >
                  <p className="text-sm text-ink text-pretty">
                    ตัวเลือกมีการเปลี่ยนแปลง — อัปเดตแล้วจะได้{' '}
                    <span className="font-medium tabular-nums">{pendingCombinations.length}</span>{' '}
                    รายการด้านล่าง (SKU ที่ตรงกับตัวเลือกเดิมจะไม่ถูกแก้ไข)
                  </p>
                  <Button type="button" size="sm" onClick={handleApplyGroups}>
                    <HiArrowPath className="size-3.5" aria-hidden="true" />
                    อัปเดตรายการตัวเลือก
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  รายการ SKU ด้านล่างตรงกับตัวเลือกปัจจุบันแล้ว
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-medium text-ink text-balance">
                รายการ SKU ({items.length})
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                แก้ไข SKU สต็อก และราคาแต่ละรายการ หรือลบรายการที่ไม่ต้องการขายได้ทันที
              </p>
            </CardHeader>
            <CardBody>
              <VariantItemsSpreadsheet items={items} onChange={setItems} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:order-2 lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-medium text-ink">สรุปตัวเลือก</h2>
            </CardHeader>
            <CardBody className="space-y-0 text-sm">
              <dl className="space-y-0">
                <div className="flex items-center justify-between border-b border-border py-3 first:pt-0">
                  <dt className="text-muted-foreground">จำนวนรายการ</dt>
                  <dd className="font-medium tabular-nums text-ink">{items.length}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-border py-3">
                  <dt className="text-muted-foreground">สต็อกรวม</dt>
                  <dd className="font-medium tabular-nums text-ink">{totalStock}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-border py-3">
                  <dt className="text-muted-foreground">หมดสต็อก</dt>
                  <dd
                    className={cn(
                      'font-medium tabular-nums',
                      outOfStockCount > 0 ? 'text-danger' : 'text-ink',
                    )}
                  >
                    {outOfStockCount}
                  </dd>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <dt className="text-muted-foreground">ช่วงราคา</dt>
                  <dd className="font-medium tabular-nums text-ink">{priceRange}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-medium text-ink">วิธีใช้งาน</h2>
            </CardHeader>
            <CardBody className="space-y-2.5 text-sm text-muted-foreground">
              <p className="text-pretty">
                เพิ่มหรือลบค่าตัวเลือกด้านบนได้ตลอด — ไม่ได้ถูกล็อกตั้งแต่สร้างสินค้า
              </p>
              <p className="text-pretty">
                ใช้ &quot;ใช้กับทุกรายการ&quot; เพื่อตั้งราคา/สต็อกหลาย SKU พร้อมกัน
              </p>
              <p className="text-pretty">วางข้อมูลจากสเปรดชีตลงในตารางได้โดยตรง</p>
              <p className="text-pretty">ลบแถวที่ไม่ขายแล้วได้ทันที โดยไม่ต้องแก้กลุ่มตัวเลือก</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <div
        className={cn(
          'sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-3.5 shadow-[var(--shadow-elevated)] backdrop-blur-md transition-colors duration-150',
          outOfSync
            ? 'border-[color-mix(in_srgb,var(--warning-text)_28%,var(--border))] bg-warning-bg/95'
            : 'border-border bg-card/95',
        )}
      >
        <p
          className={cn(
            'text-xs text-pretty',
            outOfSync ? 'font-medium text-ink' : 'text-muted-foreground',
          )}
        >
          {outOfSync
            ? 'อัปเดตรายการตัวเลือกก่อน เพื่อให้ SKU ตรงกับตัวเลือกล่าสุด'
            : items.length === 0
              ? 'เพิ่มกลุ่มตัวเลือกแล้วอัปเดตรายการก่อนบันทึก'
              : `${items.length} รายการพร้อมบันทึก`}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={`/vendor/products/${product.id}`}>กลับไปหน้าสินค้า</Link>
          </Button>
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            {isFromWizard ? 'เสร็จสิ้นและดูสินค้า' : 'บันทึก SKU/สต็อก/ราคา'}
          </Button>
        </div>
      </div>

      <VariantSyncImpactDialog
        open={impactOpen}
        onOpenChange={setImpactOpen}
        productId={product.id}
        variants={items}
        productBasePrice={product.basePrice}
        onSyncSuccess={handleSyncSuccess}
      />
    </div>
  );
}
