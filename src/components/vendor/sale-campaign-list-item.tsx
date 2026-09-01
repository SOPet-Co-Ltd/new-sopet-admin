'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SaleCampaign } from '@/types';

type CampaignEffectiveStatus = 'inactive' | 'scheduled' | 'expired' | 'active';

export function getSaleCampaignEffectiveStatus(campaign: SaleCampaign): CampaignEffectiveStatus {
  if (!campaign.isActive) return 'inactive';
  const now = Date.now();
  if (campaign.expiresAt && new Date(campaign.expiresAt).getTime() < now) return 'expired';
  if (campaign.startsAt && new Date(campaign.startsAt).getTime() > now) return 'scheduled';
  return 'active';
}

export const SALE_CAMPAIGN_EFFECTIVE_STATUS_META: Record<
  CampaignEffectiveStatus,
  { label: string; badgeStatus: string }
> = {
  inactive: { label: 'ปิดใช้งาน', badgeStatus: 'draft' },
  scheduled: { label: 'รอเริ่ม', badgeStatus: 'on_hold' },
  expired: { label: 'หมดอายุ', badgeStatus: 'archived' },
  active: { label: 'เปิดใช้งาน', badgeStatus: 'published' },
};

function formatValidity(campaign: SaleCampaign): string | null {
  if (!campaign.startsAt && !campaign.expiresAt) return null;
  const start = campaign.startsAt ? formatDate(campaign.startsAt) : 'เริ่มแล้ว';
  const end = campaign.expiresAt ? formatDate(campaign.expiresAt) : 'ไม่กำหนดสิ้นสุด';
  return `${start} – ${end}`;
}

export type SaleCampaignListItemProps = {
  campaign: SaleCampaign;
  editHref?: string;
  isToggling?: boolean;
  isDeleting?: boolean;
  onToggle: (campaign: SaleCampaign) => void;
  onDelete: (campaign: SaleCampaign) => Promise<void>;
};

export function SaleCampaignListItem({
  campaign,
  editHref,
  isToggling = false,
  isDeleting = false,
  onToggle,
  onDelete,
}: SaleCampaignListItemProps) {
  const validity = formatValidity(campaign);
  const busy = isToggling || isDeleting;
  const effectiveStatus = getSaleCampaignEffectiveStatus(campaign);
  const statusMeta = SALE_CAMPAIGN_EFFECTIVE_STATUS_META[effectiveStatus];
  const toggleLabel = campaign.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
  const href = editHref ?? `/vendor/campaigns/${campaign.id}/edit`;

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
          <p className="truncate font-medium text-ink">{campaign.name}</p>
          <Badge status={statusMeta.badgeStatus} aria-label={`สถานะ: ${statusMeta.label}`}>
            {statusMeta.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {campaign.items.length} รายการสินค้า
          {campaign.description ? ` · ${campaign.description}` : ''}
        </p>
        {validity ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{validity}</span>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={campaign.isActive ? 'outline' : 'secondary'}
          disabled={busy}
          aria-busy={isToggling}
          aria-pressed={campaign.isActive}
          aria-label={`${toggleLabel}แคมเปญ ${campaign.name}`}
          onClick={() => onToggle(campaign)}
        >
          {isToggling ? 'กำลังอัปเดต...' : toggleLabel}
        </Button>
        <Button size="sm" variant="outline" disabled={busy} asChild>
          <Link href={href}>แก้ไข</Link>
        </Button>
        <ConfirmDeleteButton
          confirmLabel={campaign.name}
          title="ลบแคมเปญ"
          description={`จะลบแคมเปญ “${campaign.name}” อย่างถาวร`}
          variant="destructive"
          disabled={busy}
          isDeleting={isDeleting}
          onConfirm={async () => {
            await onDelete(campaign);
          }}
        />
      </div>
    </li>
  );
}
