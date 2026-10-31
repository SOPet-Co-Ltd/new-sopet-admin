'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import {
  AdminOrderShippingEditDialog,
  AdminOrderStatusEditDialog,
} from '@/components/admin/admin-order-edit-dialogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminOrder } from '@/lib/api/admin-orders';
import {
  formatShippingAddress,
  getOrderCustomerEmail,
  getOrderCustomerName,
  getOrderCustomerPhone,
  isGuestOrder,
} from '@/lib/orders/display';
import { labelFulfillmentStatus, labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import { formatCombinationLabel } from '@/lib/variants';

type AdminOrderDetailProps = {
  record: AdminOrder;
};

function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 border-b border-border pb-3 last:border-b-0 last:pb-0',
        className,
      )}
    >
      <span className="pt-0.5 text-sm text-muted">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium break-words text-ink">
        {children}
      </span>
    </div>
  );
}

function MoneyRow({
  label,
  amount,
  tone = 'muted',
}: {
  label: string;
  amount: string;
  tone?: 'muted' | 'success' | 'total';
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4',
        tone === 'total' && 'border-t border-border pt-3',
      )}
    >
      <span
        className={cn(
          'text-sm',
          tone === 'total' ? 'font-semibold text-ink' : 'text-muted',
          tone === 'success' && 'text-success',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums text-sm',
          tone === 'total' && 'text-base font-semibold text-ink',
          tone === 'muted' && 'text-ink',
          tone === 'success' && 'text-success',
        )}
      >
        {amount}
      </span>
    </div>
  );
}

export function AdminOrderDetail({ record }: AdminOrderDetailProps) {
  const { order, stores, customer } = record;
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const storeNameById = new Map(stores.map((store) => [store.id, store.name || store.id]));
  const storeIds = [...new Set(order.items.map((item) => item.storeId))];
  const customerName = customer?.fullName || getOrderCustomerName(order);
  const customerPhone = customer?.phone || getOrderCustomerPhone(order);
  const customerEmail = customer?.email || getOrderCustomerEmail(order);
  const shippingAddress = formatShippingAddress(order);
  const guest = !customer && isGuestOrder(order);

  return (
    <div className="space-y-6">
      <AdminOrderStatusEditDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        orderId={order.id}
        currentStatus={order.status}
      />
      <AdminOrderShippingEditDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        order={order}
      />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">ข้อมูลคำสั่งซื้อ</h2>
            <p className="mt-0.5 text-sm text-muted">
              {formatDateTime(order.createdAt)} · {labelPaymentMethod(order.paymentMethod)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge status={order.status}>{labelOrderStatus(order.status)}</Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStatusDialogOpen(true)}
            >
              แก้ไขสถานะ
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <DetailRow label="เลขคำสั่งซื้อ">{order.orderNumber}</DetailRow>
          <DetailRow label="ร้านค้า">
            <span className="inline-flex flex-wrap justify-end gap-x-2 gap-y-1">
              {stores.length === 0
                ? '—'
                : stores.map((store, index) => (
                    <span key={store.id} className="inline-flex items-center gap-1">
                      {index > 0 ? <span className="text-muted">·</span> : null}
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="text-brand underline-offset-2 hover:underline"
                      >
                        {store.name || store.id}
                      </Link>
                    </span>
                  ))}
            </span>
          </DetailRow>
        </CardBody>
      </Card>

      {storeIds.map((storeId) => {
        const storeItems = order.items.filter((item) => item.storeId === storeId);
        const storeShipping = order.storeShippings.find((shipping) => shipping.storeId === storeId);
        const storeName = storeNameById.get(storeId) ?? storeId;

        return (
          <Card key={storeId}>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-ink">
                <Link
                  href={`/admin/stores/${storeId}`}
                  className="text-brand underline-offset-2 hover:underline"
                >
                  {storeName}
                </Link>
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {storeItems.length} รายการ
                {storeShipping ? ` · ${storeShipping.optionName}` : null}
              </p>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-5">สินค้า</TableHead>
                      <TableHead className="text-right">ราคา</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead>สถานะจัดส่ง</TableHead>
                      <TableHead>ติดตามพัสดุ</TableHead>
                      <TableHead className="pr-5 text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeItems.map((item) => {
                      const optionsLabel =
                        item.variantOptions && Object.keys(item.variantOptions).length > 0
                          ? formatCombinationLabel(item.variantOptions)
                          : '';
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="pl-5 font-medium text-ink">
                            <div>
                              <div className="text-wrap">{item.productName}</div>
                              {optionsLabel ? (
                                <div className="text-xs font-normal text-muted">{optionsLabel}</div>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted">
                            {item.quantity}
                          </TableCell>
                          <TableCell>
                            <Badge status={item.fulfillmentStatus}>
                              {labelFulfillmentStatus(item.fulfillmentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted">
                            {item.trackingNumber || '—'}
                          </TableCell>
                          <TableCell className="pr-5 text-right font-medium tabular-nums text-ink">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">ลูกค้า</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <DetailRow label="ชื่อ">
              <span className="inline-flex flex-wrap items-center justify-end gap-2">
                {customer ? (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-brand underline-offset-2 hover:underline"
                  >
                    {customerName}
                  </Link>
                ) : (
                  customerName
                )}
                {guest ? (
                  <Badge status="draft" className="font-normal">
                    ลูกค้าทั่วไป
                  </Badge>
                ) : customer ? (
                  <Badge status="published" className="font-normal">
                    สมาชิก
                  </Badge>
                ) : null}
              </span>
            </DetailRow>
            <DetailRow label="เบอร์โทรศัพท์">{customerPhone ?? '—'}</DetailRow>
            <DetailRow label="อีเมล">{customerEmail ?? '—'}</DetailRow>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">การจัดส่ง</h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!order.shippingAddress}
              onClick={() => setShippingDialogOpen(true)}
            >
              แก้ไขที่อยู่
            </Button>
          </CardHeader>
          <CardBody className="space-y-3">
            <DetailRow label="ผู้รับ">{order.shippingAddress?.fullName || '—'}</DetailRow>
            <DetailRow label="เบอร์โทรผู้รับ">{order.shippingAddress?.phone || '—'}</DetailRow>
            <DetailRow label="ที่อยู่">
              <span className="text-pretty">{shippingAddress || '—'}</span>
            </DetailRow>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-ink">สรุปยอด</h2>
        </CardHeader>
        <CardBody className="space-y-2.5">
          <MoneyRow label="ยอดสินค้า" amount={formatCurrency(order.subtotal)} />
          <MoneyRow label="ค่าจัดส่ง" amount={formatCurrency(order.shippingFee)} />
          {order.discountAmount > 0 ? (
            <MoneyRow
              label="ส่วนลด"
              amount={`-${formatCurrency(order.discountAmount)}`}
              tone="success"
            />
          ) : null}
          <MoneyRow label="รวมสุทธิ" amount={formatCurrency(order.total)} tone="total" />
        </CardBody>
      </Card>
    </div>
  );
}
