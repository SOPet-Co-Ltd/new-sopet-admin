'use client';

import { useCallback, useEffect, useState } from 'react';
import { FeatureSpotlightOverlay } from '@/components/vendor/product-tour/feature-spotlight-overlay';
import { useProductTour } from '@/components/vendor/product-tour/product-tour-provider';
import { useCurrentUser } from '@/hooks/useAuth';
import {
  clearFeatureSpotlightState,
  shouldShowFeatureSpotlight,
  writeFeatureSpotlightState,
  type FeatureSpotlightId,
} from '@/lib/vendor/feature-spotlight';

/**
 * Page-level feature spotlight controller — reusable across vendor routes.
 * Shows once per user+feature when `eligible` is true.
 * Pass `force` to replay from the tours hub even after dismiss / when not eligible.
 */
export function FeatureSpotlight({
  featureId,
  eligible,
  force = false,
  targetId,
  title,
  body,
  eyebrow,
  primaryLabel,
  skipLabel,
  onForcedDismiss,
  onCompleted,
}: {
  featureId: FeatureSpotlightId;
  eligible: boolean;
  /** Replay from ทัวร์แนะนำ — ignore prior dismiss and eligibility. */
  force?: boolean;
  targetId: string;
  title: string;
  body: string;
  eyebrow?: string;
  primaryLabel?: string;
  skipLabel?: string;
  onForcedDismiss?: () => void;
  /** Runs after primary (เข้าใจแล้ว) dismiss — e.g. continue into create-product guide. */
  onCompleted?: () => void;
}) {
  const { user } = useCurrentUser();
  const { isActive: productTourActive } = useProductTour();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked && !force) return;
    const timer = window.setTimeout(() => {
      if (force && !productTourActive) {
        if (user?.id) {
          clearFeatureSpotlightState(user.id, featureId);
        }
        setOpen(true);
        setChecked(true);
        return;
      }
      if (checked) return;
      setOpen(
        shouldShowFeatureSpotlight({
          userId: user?.id,
          featureId,
          eligible,
          blockedByOtherTour: productTourActive,
        }),
      );
      setChecked(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checked, user, featureId, eligible, productTourActive, force]);

  useEffect(() => {
    if (!checked || force) return;
    const timer = window.setTimeout(() => {
      if (!eligible || productTourActive) {
        setOpen(false);
        return;
      }
      if (
        shouldShowFeatureSpotlight({
          userId: user?.id,
          featureId,
          eligible: true,
          blockedByOtherTour: false,
        })
      ) {
        setOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checked, eligible, productTourActive, user?.id, featureId, force]);

  const dismiss = useCallback(
    (status: 'completed' | 'skipped') => {
      if (user?.id) {
        writeFeatureSpotlightState(user.id, featureId, status);
      }
      setOpen(false);
      if (force) {
        onForcedDismiss?.();
      }
      if (status === 'completed') {
        onCompleted?.();
      }
    },
    [user, featureId, force, onForcedDismiss, onCompleted],
  );

  if (!open) return null;

  return (
    <FeatureSpotlightOverlay
      targetId={targetId}
      title={title}
      body={body}
      eyebrow={eyebrow}
      primaryLabel={primaryLabel}
      skipLabel={skipLabel}
      onPrimary={() => dismiss('completed')}
      onSkip={() => dismiss('skipped')}
    />
  );
}
