'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { AdminOrderDetail } from '@/components/admin/admin-order-detail';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/card';
import { useAdminOrder } from '@/hooks/useAdminOrders';
import { getErrorMessage } from '@/lib/api/errors';
import { labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
import { formatDateTime } from '@/lib/utils';

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดคำสั่งซื้อ">
      <div className="space-y-3">
        <div className="h-4 w-36 animate-pulse rounded bg-brand-tint motion-reduce:animate-none" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded bg-brand-tint motion-reduce:animate-none" />
        <div className="h-4 w-48 animate-pulse rounded bg-brand-tint motion-reduce:animate-none" />
      </div>
      <div className="h-36 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none" />
      </div>
      <div className="h-52 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none" />
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const { data, isLoading, error } = useAdminOrder(orderId);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
        >
          <HiArrowLeft className="size-3.5" aria-hidden="true" />
          กลับรายการคำสั่งซื้อ
        </Link>
        <p className="text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดคำสั่งซื้อไม่สำเร็จ')}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
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

  const { order } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${formatDateTime(order.createdAt)} · ${labelPaymentMethod(order.paymentMethod)}`}
        back={
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการคำสั่งซื้อ
          </Link>
        }
        action={<Badge status={order.status}>{labelOrderStatus(order.status)}</Badge>}
      />

      <AdminOrderDetail record={data} />
    </div>
  );
}
