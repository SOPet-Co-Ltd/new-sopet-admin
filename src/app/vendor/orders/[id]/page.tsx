'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { VendorOrderDetail } from '@/components/vendor/vendor-order-detail';
import { PageHeader } from '@/components/ui/card';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const storeId = useVendorStoreId();
  const { data: orders = [], isLoading, error } = useVendorOrders(storeId);

  const order = useMemo(
    () => orders.find((item) => item.id === orderId) ?? null,
    [orders, orderId],
  );

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดคำสั่งซื้อ...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error instanceof Error ? error.message : 'โหลดคำสั่งซื้อไม่สำเร็จ'}
      </p>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
        >
          <HiArrowLeft className="size-3.5" aria-hidden="true" />
          กลับรายการคำสั่งซื้อ
        </Link>
        <p className="text-sm text-danger" role="alert">
          ไม่พบคำสั่งซื้อ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description="รายละเอียดคำสั่งซื้อ"
        back={
          <Link
            href="/vendor/orders"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการคำสั่งซื้อ
          </Link>
        }
      />

      <VendorOrderDetail order={order} storeId={storeId} />
    </div>
  );
}
