'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { labelPromotionType } from '@/lib/i18n/th';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Promotion } from '@/types';

function formatDiscount(promo: Promotion): string {
  if (promo.type === 'percentage' || promo.type === 'percentage_shipping_discount') {
    return `${promo.discountValue}%`;
  }
  if (promo.type === 'free_shipping') {
    return 'ฟรีค่าส่ง';
  }
  return formatCurrency(promo.discountValue);
}

function formatValidity(promo: Promotion): string | null {
  if (!promo.startsAt && !promo.expiresAt) return null;
  const start = promo.startsAt ? formatDate(promo.startsAt) : 'เริ่มแล้ว';
  const end = promo.expiresAt ? formatDate(promo.expiresAt) : 'ไม่กำหนดสิ้นสุด';
  return `${start} – ${end}`;
}

function formatUsage(promo: Promotion): string {
  const used = `ใช้แล้ว ${promo.usageCount}`;
  if (promo.usageLimit) {
    return `${used} / ${promo.usageLimit} ครั้ง`;
  }
  return `${used} ครั้ง`;
}

export type VendorPromotionListItemProps = {
  promo: Promotion;
  /** Edit route — defaults to vendor promotions edit. */
  editHref?: string;
  isToggling?: boolean;
  isDeleting?: boolean;
  onToggle: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => Promise<void>;
};

export function VendorPromotionListItem({
  promo,
  editHref,
  isToggling = false,
  isDeleting = false,
  onToggle,
  onDelete,
}: VendorPromotionListItemProps) {
  const validity = formatValidity(promo);
  const busy = isToggling || isDeleting;
  const statusLabel = promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
  const toggleLabel = promo.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
  const href = editHref ?? `/vendor/promotions/${promo.id}/edit`;

  return (
    <li
      className={cn(
        'flex flex-col gap-4 px-4 py-4 transition-colors duration-150 ease-out sm:flex-row sm:items-center sm:justify-between',
        'hover:bg-surface/80 motion-reduce:transition-none',
        busy && 'opacity-80',
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-ink">{promo.name}</p>
          <Badge
            status={promo.isActive ? 'published' : 'draft'}
            aria-label={`สถานะ: ${statusLabel}`}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-ink">{promo.code}</span>
          {' · '}
          {labelPromotionType(promo.type)}
          {' · '}
          {formatDiscount(promo)}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatUsage(promo)}</span>
          {validity ? <span>{validity}</span> : null}
          {promo.autoApply ? <span>ใช้อัตโนมัติ</span> : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={promo.isActive ? 'outline' : 'secondary'}
          disabled={busy}
          aria-busy={isToggling}
          aria-pressed={promo.isActive}
          aria-label={`${toggleLabel}โปรโมชัน ${promo.name}`}
          onClick={() => onToggle(promo)}
        >
          {isToggling ? 'กำลังอัปเดต...' : toggleLabel}
        </Button>
        <Button size="sm" variant="outline" disabled={busy} asChild>
          <Link href={href}>แก้ไข</Link>
        </Button>
        <ConfirmDeleteButton
          confirmLabel={promo.name}
          title="ลบโปรโมชัน"
          description={`จะลบโปรโมชัน “${promo.name}” (${promo.code}) อย่างถาวร`}
          variant="destructive"
          disabled={busy}
          isDeleting={isDeleting}
          onConfirm={async () => {
            await onDelete(promo);
          }}
        />
      </div>
    </li>
  );
}
