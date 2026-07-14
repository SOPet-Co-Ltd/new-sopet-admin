'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { VariantItemsSpreadsheet } from '@/components/vendor/variant-items-spreadsheet';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useProduct } from '@/hooks/useProduct';
import { useSyncProductVariants } from '@/hooks/useSyncProductVariants';
import { extractOptionGroups, variantItemsFromProduct, type VariantItem } from '@/lib/variants';

export default function ProductVariantsPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { data: product, isLoading, error } = useProduct(productId);
  const syncMutation = useSyncProductVariants();

  const [items, setItems] = useState<VariantItem[]>([]);
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (product && product.id !== loadedProductId) {
    setLoadedProductId(product.id);
    setItems(variantItemsFromProduct(product.variants ?? []));
  }

  const optionGroups = useMemo(() => extractOptionGroups(items), [items]);

  async function handleSave() {
    if (!product) return;
    try {
      await syncMutation.mutateAsync({
        productId: product.id,
        variants: items,
        productBasePrice: product.basePrice,
      });
      setSaved(true);
    } catch {
      // surfaced via mutation state
    }
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดสินค้า...</p>;
  }

  if (error || !product) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'ไม่พบสินค้า'}
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        description="ขั้นที่ 2 — แก้ไข SKU สต็อก และราคาแต่ละรายการตัวเลือก"
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

      <div className="space-y-6">
        {optionGroups.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 className="font-display font-medium text-ink">กลุ่มตัวเลือก</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="space-y-2">
                {optionGroups.map((group) => (
                  <div key={group.name} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">{group.name}:</span>
                    {group.values.map((value) => (
                      <span
                        key={value}
                        className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">
                กลุ่มตัวเลือกถูกกำหนดตอนสร้างสินค้าและแก้ไขที่นี่ไม่ได้ — ปรับได้เฉพาะ SKU สต็อก
                และราคาของแต่ละรายการด้านล่าง
              </p>
            </CardBody>
          </Card>
        ) : null}

        <div className="space-y-3">
          <h2 className="font-display font-medium text-ink">รายการตัวเลือก ({items.length})</h2>
          <VariantItemsSpreadsheet items={items} onChange={setItems} />
        </div>

        {syncMutation.error ? (
          <p className="text-sm text-danger">
            {syncMutation.error instanceof Error
              ? syncMutation.error.message
              : 'บันทึก SKU/สต็อก/ราคาไม่สำเร็จ'}
          </p>
        ) : null}

        {saved ? <p className="text-sm text-success">บันทึก SKU/สต็อก/ราคาแล้ว</p> : null}

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/products">กลับไปหน้าสินค้า</Link>
          </Button>
          <Button
            type="button"
            disabled={syncMutation.isPending || items.length === 0}
            aria-busy={syncMutation.isPending}
            onClick={handleSave}
          >
            {syncMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก SKU/สต็อก/ราคา'}
          </Button>
        </div>
      </div>
    </div>
  );
}
