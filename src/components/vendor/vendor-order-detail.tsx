import type { ReactNode } from 'react';
import { VendorOrderWorkflow } from '@/components/vendor/vendor-order-workflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { labelFulfillmentStatus, labelOrderStatus } from '@/lib/i18n/th';
import {
  formatShippingAddress,
  getOrderCustomerEmail,
  getOrderCustomerName,
  getOrderCustomerPhone,
  getStoreDiscountAmount,
  getStoreOrderTotal,
  getStoreOrderItems,
  getStoreShipping,
  getUniqueStoreIds,
  isGuestOrder,
  sumItemSubtotals,
} from '@/lib/orders/display';
import { cn, formatCurrency } from '@/lib/utils';
import { formatCombinationLabel } from '@/lib/variants';
import type { Order } from '@/types';

export interface VendorOrderDetailProps {
  order: Order;
  storeId?: string;
}

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
        'flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0',
        className,
      )}
    >
      <span className="shrink-0 text-sm text-muted">{label}</span>
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

export function VendorOrderDetail({ order, storeId }: VendorOrderDetailProps) {
  const storeItems = getStoreOrderItems(order, storeId);
  const storeShipping = getStoreShipping(order, storeId);
  const storeSubtotal = sumItemSubtotals(storeItems);
  const storeDiscount = getStoreDiscountAmount(order, storeId);
  const storeTotal = getStoreOrderTotal(order, storeId);
  const customerPhone = getOrderCustomerPhone(order);
  const customerEmail = getOrderCustomerEmail(order);
  const shippingAddress = formatShippingAddress(order);
  const hasMultipleStores = getUniqueStoreIds(order).length > 1;
  const recipientName = order.shippingAddress?.fullName ?? getOrderCustomerName(order);
  const recipientPhone = order.shippingAddress?.phone ?? customerPhone ?? '—';

  return (
    <div className="space-y-6">
      {/* Next action first — Trust Desk: fulfillment before read-only facts */}
      <VendorOrderWorkflow order={order} storeId={storeId} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">สินค้าในร้านของคุณ</h2>
            <p className="mt-0.5 text-sm text-muted">
              {storeItems.length} รายการ · สถานะคำสั่งซื้อ {labelOrderStatus(order.status)}
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">สินค้า</TableHead>
                  <TableHead className="text-right">ราคา</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead>สถานะ</TableHead>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">ลูกค้า</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <DetailRow label="ชื่อ">
              <span className="inline-flex flex-wrap items-center justify-end gap-2">
                {getOrderCustomerName(order)}
                {isGuestOrder(order) ? (
                  <Badge status="draft" className="font-normal">
                    ลูกค้าทั่วไป
                  </Badge>
                ) : (
                  <Badge status="published" className="font-normal">
                    สมาชิก
                  </Badge>
                )}
              </span>
            </DetailRow>
            <DetailRow label="เบอร์โทรศัพท์">{customerPhone ?? '—'}</DetailRow>
            {customerEmail ? <DetailRow label="อีเมล">{customerEmail}</DetailRow> : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">การจัดส่ง</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <DetailRow label="ผู้รับ">{recipientName}</DetailRow>
            <DetailRow label="เบอร์โทรผู้รับ">{recipientPhone}</DetailRow>
            {storeShipping ? (
              <>
                <DetailRow label="วิธีจัดส่ง">{storeShipping.optionName}</DetailRow>
                <DetailRow label="ค่าจัดส่ง">
                  <span className="tabular-nums">{formatCurrency(storeShipping.shippingFee)}</span>
                </DetailRow>
              </>
            ) : null}
            {shippingAddress ? (
              <DetailRow label="ที่อยู่">
                <span className="max-w-[28ch] text-pretty">{shippingAddress}</span>
              </DetailRow>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-ink">สรุปยอดร้านของคุณ</h2>
        </CardHeader>
        <CardBody className="space-y-2.5">
          <MoneyRow label="ยอดสินค้า" amount={formatCurrency(storeSubtotal)} />
          {storeShipping ? (
            <MoneyRow label="ค่าจัดส่ง" amount={formatCurrency(storeShipping.shippingFee)} />
          ) : null}
          {storeDiscount > 0 ? (
            <MoneyRow label="ส่วนลด" amount={`-${formatCurrency(storeDiscount)}`} tone="success" />
          ) : null}
          <MoneyRow label="รวมสุทธิ" amount={formatCurrency(storeTotal)} tone="total" />
          {hasMultipleStores ? (
            <p className="pt-1 text-xs text-muted text-pretty">
              คำสั่งซื้อนี้มีสินค้าจากหลายร้าน ยอดรวมทั้งคำสั่งซื้อ{' '}
              <span className="tabular-nums font-medium text-ink">
                {formatCurrency(order.total)}
              </span>
              {order.discountAmount > 0
                ? ` (ส่วนลดทั้งคำสั่งซื้อ ${formatCurrency(order.discountAmount)})`
                : null}
              {storeDiscount > 0 && order.discountAmount > storeDiscount
                ? ' — ส่วนลดแพลตฟอร์มแบ่งตามสัดส่วนยอดสินค้า'
                : null}
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
