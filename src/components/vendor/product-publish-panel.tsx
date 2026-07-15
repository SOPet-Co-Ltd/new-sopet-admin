'use client';

import { HiCheck, HiXMark } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type ProductPublishPanelProps = {
  status: ProductStatus;
  selectableStatuses: ProductStatus[];
  onStatusChange: (status: ProductStatus) => void;
  checklist?: ProductPublishChecklist | null;
  checklistLoading?: boolean;
  canPublish: boolean;
  onPublish: () => void;
  publishPending: boolean;
};

export function ProductPublishPanel({
  status,
  selectableStatuses,
  onStatusChange,
  checklist,
  checklistLoading,
  canPublish,
  onPublish,
  publishPending,
}: ProductPublishPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-medium text-ink">การเผยแพร่</h2>
          <Badge status={status}>{labelProductStatus(status)}</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div>
          <Label htmlFor="status">สถานะสินค้า</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              // Ignore the spurious empty callback Radix Select can emit while
              // its items register after hydration, which would otherwise wipe
              // the loaded status and fail enum validation on save.
              if (!value) return;
              onStatusChange(value as ProductStatus);
            }}
          >
            <SelectTrigger id="status" className="mt-1.5">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              {selectableStatuses.map((option) => (
                <SelectItem key={option} value={option}>
                  {labelProductStatus(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status === 'draft' ? (
          <div className="rounded-lg border border-dashed border-border bg-surface/60 p-3">
            <Button
              type="button"
              className="w-full"
              onClick={onPublish}
              disabled={!canPublish}
              aria-busy={publishPending}
            >
              {publishPending ? 'กำลังเผยแพร่...' : 'เผยแพร่สินค้า'}
            </Button>
            {!canPublish && !checklistLoading ? (
              <p className="mt-2 text-center text-xs text-muted">
                เติมรายการตรวจสอบด้านล่างให้ครบก่อนเผยแพร่
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            รายการตรวจสอบก่อนเผยแพร่
          </p>
          {checklistLoading ? (
            <p className="text-sm text-muted">กำลังตรวจสอบความพร้อม...</p>
          ) : checklist ? (
            <>
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
              {status !== 'draft' ? (
                <p className="mt-3 text-xs text-muted">
                  {checklist.canPublish ? 'สินค้าครบรายการที่ต้องมี' : 'สินค้ายังขาดข้อมูลบางส่วน'}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted">ไม่สามารถโหลดรายการตรวจสอบได้</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
