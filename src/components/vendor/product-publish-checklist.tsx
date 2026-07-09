'use client';

import { HiCheck, HiXMark } from 'react-icons/hi2';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { labelProductStatus } from '@/lib/i18n/th';
import type { ProductPublishChecklist, ProductStatus } from '@/types';

const CHECKLIST_LABELS: Record<string, string> = {
  name: 'ชื่อสินค้า',
  media: 'รูปภาพสินค้า (อย่างน้อย 1 รูป)',
  category: 'หมวดหมู่',
  petType: 'ประเภทสัตว์เลี้ยง',
  variants: 'ตัวเลือกสินค้า (อย่างน้อย 1 รายการ)',
  price: 'ราคา',
  stock: 'สต็อก',
};

type ProductPublishChecklistPanelProps = {
  status: ProductStatus | string;
  checklist?: ProductPublishChecklist | null;
  isLoading?: boolean;
};

export function ProductPublishChecklistPanel({
  status,
  checklist,
  isLoading,
}: ProductPublishChecklistPanelProps) {
  const normalizedStatus = String(status) as ProductStatus;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-medium text-ink">สถานะการเผยแพร่</h2>
          <Badge status={normalizedStatus}>{labelProductStatus(normalizedStatus)}</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted">กำลังตรวจสอบความพร้อม...</p>
        ) : checklist ? (
          <>
            <p className="text-sm text-muted">สินค้าต้องครบทุกรายการด้านล่างก่อนจึงจะเผยแพร่ได้</p>
            <ul className="space-y-2">
              {checklist.items.map((item) => (
                <li key={item.key} className="flex items-start gap-2 text-sm">
                  {item.complete ? (
                    <HiCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <HiXMark className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                  )}
                  <span className={item.complete ? 'text-ink' : 'text-muted'}>
                    {CHECKLIST_LABELS[item.key] ?? item.key}
                  </span>
                </li>
              ))}
            </ul>
            {checklist.canPublish ? (
              <p className="text-sm text-success">พร้อมเผยแพร่แล้ว</p>
            ) : (
              <p className="text-sm text-danger">
                ยังไม่พร้อมเผยแพร่ — กรุณาเติมข้อมูลที่ขาดให้ครบ
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">ไม่สามารถโหลดรายการตรวจสอบได้</p>
        )}
      </CardBody>
    </Card>
  );
}
