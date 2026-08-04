'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type RequestsTab = 'stores' | 'invitations';

export interface RequestsTabCounts {
  stores: number;
  invitations: number;
}

const TAB_LABELS: Record<RequestsTab, string> = {
  stores: 'คำขอเปิดร้าน',
  invitations: 'เชิญผู้ขาย',
};

export function RequestsTabBar({
  tab,
  counts,
  onTabChange,
}: {
  tab: RequestsTab;
  counts: RequestsTabCounts;
  onTabChange: (tab: RequestsTab) => void;
}) {
  const tabs: RequestsTab[] = ['stores', 'invitations'];

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="ประเภทคำขอ">
      {tabs.map((item) => {
        const count = counts[item];
        const isActive = tab === item;

        return (
          <Button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`requests-panel-${item}`}
            id={`requests-tab-${item}`}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onTabChange(item)}
            className={cn('gap-2', isActive && 'shadow-sm')}
          >
            <span>{TAB_LABELS[item]}</span>
            <Badge
              className={cn(
                'min-w-[1.25rem] justify-center px-1.5 tabular-nums',
                isActive
                  ? 'border border-white/20 bg-white/15 text-white'
                  : count > 0
                    ? 'border border-brand/20 bg-brand-tint text-brand'
                    : undefined,
              )}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
