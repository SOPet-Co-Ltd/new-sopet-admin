'use client';

import { HiArrowRight } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RequestsTab, RequestsTabCounts } from './requests-tab-bar';

const TAB_ACTION_LABELS: Record<RequestsTab, string> = {
  stores: 'อนุมัติคำขอเปิดร้าน',
  taxonomy: 'ตรวจหมวดหมู่/แท็ก',
  invitations: 'เชิญผู้ขาย',
};

function getNextTab(counts: RequestsTabCounts): RequestsTab | null {
  if (counts.stores > 0) return 'stores';
  if (counts.taxonomy > 0) return 'taxonomy';
  if (counts.invitations > 0) return 'invitations';
  return null;
}

export function RequestsQueueSummary({
  counts,
  activeTab,
  onGoToNext,
}: {
  counts: RequestsTabCounts;
  activeTab: RequestsTab;
  onGoToNext: (tab: RequestsTab) => void;
}) {
  const total = counts.stores + counts.taxonomy + counts.invitations;
  const nextTab = getNextTab(counts);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-success/20 bg-success-bg/30 px-4 py-3 sm:px-5">
        <p className="font-medium text-ink">คิวว่างแล้ว</p>
        <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
          ไม่มีคำขอรอดำเนินการ — คำขอใหม่จะปรากฏที่นี่ทันที
        </p>
      </div>
    );
  }

  const nextCount = nextTab ? counts[nextTab] : 0;
  const onNextTab = nextTab !== null && activeTab !== nextTab;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-5',
        onNextTab ? 'border-brand/25 bg-brand-tint/40' : 'border-border bg-card',
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-ink">{total.toLocaleString('th-TH')} รายการรอดำเนินการ</p>
        <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
          {nextTab ? (
            <>
              ถัดไป: {TAB_ACTION_LABELS[nextTab]} ({nextCount.toLocaleString('th-TH')} รายการ)
              {nextTab === 'stores'
                ? ' — เริ่มจากรายการแรกด้านล่าง'
                : nextTab === 'taxonomy'
                  ? ' — ตรวจรูปภาพก่อนอนุมัติหมวดหมู่'
                  : ' — ส่งคำเชิญหรือติดตามสถานะ'}
            </>
          ) : null}
        </p>
      </div>
      {onNextTab && nextTab ? (
        <Button
          type="button"
          size="sm"
          className="mt-3 shrink-0 sm:mt-0"
          onClick={() => onGoToNext(nextTab)}
        >
          ไปที่{TAB_ACTION_LABELS[nextTab]}
          <HiArrowRight className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
