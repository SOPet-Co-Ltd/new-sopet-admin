'use client';

import { VendorOrderWorkflow } from '@/components/vendor/vendor-order-workflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { labelFulfillmentStatus, labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
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
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

interface VendorOrderDetailDialogProps {
  order: Order | null;
  storeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-ink">{children}</h3>;
}

export function VendorOrderDetailDialog({
  order,
  storeId,
  open,
  onOpenChange,
}: VendorOrderDetailDialogProps) {
  if (!order) return null;

  const storeItems = getStoreOrderItems(order, storeId);
  const storeShipping = getStoreShipping(order, storeId);
  const storeSubtotal = sumItemSubtotals(storeItems);
  const storeDiscount = getStoreDiscountAmount(order, storeId);
  const storeTotal = getStoreOrderTotal(order, storeId);
  const customerPhone = getOrderCustomerPhone(order);
  const customerEmail = getOrderCustomerEmail(order);
  const shippingAddress = formatShippingAddress(order);
  const hasMultipleStores = getUniqueStoreIds(order).length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle>{order.orderNumber}</DialogTitle>
              <DialogDescription>{formatDateTime(order.createdAt)}</DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={order.status}>{labelOrderStatus(order.status)}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <SectionTitle>ลูกค้า</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="ชื่อ"
                  value={
                    <span className="inline-flex items-center gap-2">
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
                  }
                />
                <DetailField label="เบอร์โทรศัพท์" value={customerPhone ?? '—'} />
                {customerEmail ? <DetailField label="อีเมล" value={customerEmail} /> : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <SectionTitle>การชำระเงิน</SectionTitle>
              <DetailField label="ช่องทาง" value={labelPaymentMethod(order.paymentMethod)} />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <SectionTitle>สินค้าในร้านของคุณ</SectionTitle>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/60 hover:bg-surface/60">
                      <TableHead>สินค้า</TableHead>
                      <TableHead className="text-right">ราคา</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead className="hidden sm:table-cell">สถานะ</TableHead>
                      <TableHead className="text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-ink">{item.productName}</TableCell>
                        <TableCell className="text-right text-muted">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right text-muted">{item.quantity}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge status={item.fulfillmentStatus}>
                            {labelFulfillmentStatus(item.fulfillmentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-ink">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <SectionTitle>การจัดส่ง</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="ผู้รับ"
                  value={order.shippingAddress?.fullName ?? getOrderCustomerName(order)}
                />
                <DetailField
                  label="เบอร์โทรผู้รับ"
                  value={order.shippingAddress?.phone ?? customerPhone ?? '—'}
                />
                {storeShipping ? (
                  <>
                    <DetailField label="วิธีจัดส่ง" value={storeShipping.optionName} />
                    <DetailField
                      label="ค่าจัดส่ง (ร้านของคุณ)"
                      value={formatCurrency(storeShipping.shippingFee)}
                    />
                  </>
                ) : null}
              </div>
              {shippingAddress ? (
                <DetailField label="ที่อยู่จัดส่ง" value={shippingAddress} />
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3 text-sm">
              <SectionTitle>สรุปยอด (ร้านของคุณ)</SectionTitle>
              <div className="flex justify-between text-muted">
                <span>ยอดสินค้า</span>
                <span>{formatCurrency(storeSubtotal)}</span>
              </div>
              {storeShipping ? (
                <div className="flex justify-between text-muted">
                  <span>ค่าจัดส่ง</span>
                  <span>{formatCurrency(storeShipping.shippingFee)}</span>
                </div>
              ) : null}
              {storeDiscount > 0 ? (
                <div className="flex justify-between text-success">
                  <span>ส่วนลด</span>
                  <span>-{formatCurrency(storeDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-3 font-semibold text-ink">
                <span>รวม (ร้านของคุณ)</span>
                <span>{formatCurrency(storeTotal)}</span>
              </div>
              {hasMultipleStores ? (
                <p className="text-xs text-muted">
                  คำสั่งซื้อนี้มีสินค้าจากหลายร้าน ยอดรวมทั้งคำสั่งซื้อ{' '}
                  {formatCurrency(order.total)}
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

          <VendorOrderWorkflow order={order} storeId={storeId} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
