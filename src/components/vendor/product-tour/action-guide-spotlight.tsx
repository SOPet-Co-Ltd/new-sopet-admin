'use client';

import { useCallback, useEffect, useState } from 'react';
import { FeatureSpotlightOverlay } from '@/components/vendor/product-tour/feature-spotlight-overlay';
import { useProductTour } from '@/components/vendor/product-tour/product-tour-provider';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  ACTION_GUIDE_CHANGE_EVENT,
  advanceActionGuide,
  clearActionGuide,
  getActionGuideTip,
  isActionGuideActive,
  markActionGuideSeen,
  readActionGuideState,
  type ActionGuideId,
} from '@/lib/vendor/action-guide';

/**
 * Multi-step action guide spotlight driven by sessionStorage.
 * Marks the guide as seen (localStorage) when the user finishes or skips — auto-show once.
 */
export function ActionGuideSpotlight({ guideId }: { guideId: ActionGuideId }) {
  const { user } = useCurrentUser();
  const { isActive: productTourActive } = useProductTour();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  const step = isActionGuideActive(guideId) ? readActionGuideState().step : 0;
  const tip = step > 0 ? getActionGuideTip(guideId, step) : undefined;

  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    window.addEventListener(ACTION_GUIDE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(ACTION_GUIDE_CHANGE_EVENT, onChange);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(isActionGuideActive(guideId) && !productTourActive && tip != null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [guideId, productTourActive, tip, tick, step]);

  const markSeen = useCallback(() => {
    if (user?.id) {
      markActionGuideSeen(user.id, guideId);
    }
  }, [user, guideId]);

  const onPrimary = useCallback(() => {
    advanceActionGuide();
    if (!isActionGuideActive(guideId)) {
      markSeen();
    }
    setTick((n) => n + 1);
  }, [guideId, markSeen]);

  const onSkip = useCallback(() => {
    markSeen();
    clearActionGuide();
    setOpen(false);
    setTick((n) => n + 1);
  }, [markSeen]);

  if (!open || !tip) return null;

  return (
    <FeatureSpotlightOverlay
      targetId={tip.targetId}
      title={tip.title}
      body={tip.body}
      primaryLabel={tip.primaryLabel}
      onPrimary={onPrimary}
      onSkip={onSkip}
    />
  );
}
