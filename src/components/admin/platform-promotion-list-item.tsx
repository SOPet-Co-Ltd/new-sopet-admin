'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { labelPromotionType } from '@/lib/i18n/th';
import { parsePromotionConditions } from '@/lib/validations/promotions';
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

/**
 * AC-034 / AC-020 list chips from conditions JSON.
 * Normative order (UI-L-001): members-only → new-customer → BxGy.
 * Soft-omits chips when parse yields nothing useful.
 */
export function formatPromotionConditionChips(
  conditions?: string | null,
  options?: { productName?: string },
): string[] {
  const parsed = parsePromotionConditions(conditions);
  const chips: string[] = [];

  if (parsed.loggedInOnlyEnabled) {
    chips.push('สมาชิกเท่านั้น');
  }

  if (
    parsed.newCustomerOnly &&
    typeof parsed.newCustomerMaxAccountAgeDays === 'number' &&
    parsed.newCustomerMaxAccountAgeDays > 0
  ) {
    chips.push(`ลูกค้าใหม่ ≤ ${parsed.newCustomerMaxAccountAgeDays} วัน`);
  }

  if (
    typeof parsed.buyQuantity === 'number' &&
    typeof parsed.getQuantity === 'number' &&
    parsed.productId
  ) {
    const productLabel = options?.productName?.trim() || parsed.productId;
    chips.push(`ซื้อ ${parsed.buyQuantity} แถม ${parsed.getQuantity} · ${productLabel}`);
  }

  return chips;
}

export type PlatformPromotionListItemProps = {
  promo: Promotion;
  isToggling?: boolean;
  isDeleting?: boolean;
  onToggle: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => Promise<void>;
};

export function PlatformPromotionListItem({
  promo,
  isToggling = false,
  isDeleting = false,
  onToggle,
  onDelete,
}: PlatformPromotionListItemProps) {
  const validity = formatValidity(promo);
  const busy = isToggling || isDeleting;
  const statusLabel = promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
  const toggleLabel = promo.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
  const conditionChips = formatPromotionConditionChips(promo.conditions);

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
        {conditionChips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" aria-label="เงื่อนไขโปรโมชัน">
            {conditionChips.map((chip) => (
              <Badge key={chip} className="bg-brand-tint text-brand border-0">
                {chip}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatUsage(promo)}</span>
          {validity ? <span>{validity}</span> : null}
          {promo.autoApply ? <span>ใช้อัตโนมัติ</span> : null}
          {promo.priority > 0 ? <span>ลำดับ {promo.priority}</span> : null}
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
          <Link href={`/admin/promotions/${promo.id}/edit`}>แก้ไข</Link>
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
