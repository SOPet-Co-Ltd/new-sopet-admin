'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiPlay, HiCheckCircle, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { useProductTour } from '@/components/vendor/product-tour/product-tour-provider';
import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreManager, useIsStoreOwner } from '@/hooks/useMembershipRole';
import {
  ACTION_GUIDE_QUERY,
  clearActionGuideSeen,
  hasSeenActionGuide,
  startActionGuide,
  type ActionGuideId,
} from '@/lib/vendor/action-guide';
import {
  clearFeatureSpotlightState,
  hasDismissedFeatureSpotlight,
  type FeatureSpotlightId,
} from '@/lib/vendor/feature-spotlight';
import {
  hasCompletedOrSkippedProductTour,
  resolveProductTourPath,
  resolveProductTourRole,
} from '@/lib/vendor/product-tour';
import { SPOTLIGHT_GUIDES, type SpotlightGuideDefinition } from '@/lib/vendor/spotlight-guides';

const ACTION_IDS = new Set<ActionGuideId>([
  'create-promotion',
  'create-campaign',
  'invite-team',
  'request-store',
  'setup-payout',
]);

/** Entry spotlight ids that continue into a multi-step action guide. */
const FEATURE_TO_ACTION_GUIDE: Partial<Record<FeatureSpotlightId, ActionGuideId>> = {
  'promotions-empty-add': 'create-promotion',
  'campaigns-empty-add': 'create-campaign',
  'team-invite': 'invite-team',
  'stores-request': 'request-store',
  'payout-setup': 'setup-payout',
};

function guideStatusLabel(seen: boolean): string {
  return seen ? 'ดูแล้ว' : 'ยังไม่ดู';
}

export function SpotlightGuidesPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const { isManager } = useIsStoreManager();
  const { startTour, isActive } = useProductTour();
  const [statusTick, setStatusTick] = useState(0);

  const tourPath = resolveProductTourPath(
    resolveProductTourRole({
      isOwner,
      isManager: isManager && !isOwner,
    }),
  );

  const guidesWithStatus = useMemo(() => {
    void statusTick;
    return SPOTLIGHT_GUIDES.map((guide) => {
      let seen = false;
      if (user?.id) {
        if (guide.kind === 'shell-tour') {
          seen = hasCompletedOrSkippedProductTour(user.id, tourPath);
        } else if (guide.featureId) {
          const actionId = FEATURE_TO_ACTION_GUIDE[guide.featureId];
          seen =
            hasDismissedFeatureSpotlight(user.id, guide.featureId) ||
            (actionId ? hasSeenActionGuide(user.id, actionId) : false);
        }
      }
      return { guide, seen };
    });
  }, [user?.id, tourPath, statusTick]);

  function startGuide(guide: SpotlightGuideDefinition) {
    if (guide.kind === 'shell-tour') {
      startTour();
      setStatusTick((n) => n + 1);
      return;
    }
    if (guide.featureId && user?.id) {
      clearFeatureSpotlightState(user.id, guide.featureId);
      const actionId = FEATURE_TO_ACTION_GUIDE[guide.featureId];
      if (actionId) {
        clearActionGuideSeen(user.id, actionId);
      }
    }
    if (guide.href) {
      const url = new URL(guide.href, 'http://local');
      const guideParam = url.searchParams.get(ACTION_GUIDE_QUERY);
      if (guideParam && ACTION_IDS.has(guideParam as ActionGuideId)) {
        if (user?.id) {
          clearActionGuideSeen(user.id, guideParam as ActionGuideId);
        }
        startActionGuide(guideParam as ActionGuideId, { force: true, userId: user?.id });
      }
      router.push(guide.href);
    }
    setStatusTick((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ทัวร์แนะนำ"
        description="รวมคำแนะนำแบบไฮไลต์ในพอร์ทัล — เปิดดูหรือดูซ้ำได้ทุกเมื่อ"
      />

      <ul className="space-y-3">
        {guidesWithStatus.map(({ guide, seen }) => (
          <li
            key={guide.id}
            className="rounded-xl border border-border bg-white p-4 sm:flex sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <HiOutlineQuestionMarkCircle
                  className="size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <h2 className="font-display text-base font-medium text-ink">{guide.title}</h2>
                <Badge
                  className={seen ? undefined : 'bg-brand-tint text-brand border border-brand/20'}
                >
                  {guideStatusLabel(seen)}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">
                {guide.description}
              </p>
              <p className="mt-1 text-xs text-muted">
                {guide.kind === 'shell-tour' ? 'ทัวร์เมนูด้านข้าง' : 'คำแนะนำบนหน้าจอเฉพาะ'}
              </p>
            </div>
            <div className="mt-3 shrink-0 sm:mt-0">
              <Button
                type="button"
                size="sm"
                onClick={() => startGuide(guide)}
                disabled={guide.kind === 'shell-tour' && isActive}
              >
                {seen ? (
                  <>
                    <HiCheckCircle className="size-4" aria-hidden="true" />
                    ดูซ้ำ
                  </>
                ) : (
                  <>
                    <HiPlay className="size-4" aria-hidden="true" />
                    เริ่มทัวร์
                  </>
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
