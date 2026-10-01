'use client';

import { useCallback, useEffect, useState } from 'react';
import { FeatureSpotlightOverlay } from '@/components/vendor/product-tour/feature-spotlight-overlay';
import { useProductTour } from '@/components/vendor/product-tour/product-tour-provider';
import {
  clearCreateProductGuide,
  getCreateProductGuideTip,
  isCreateProductGuideActive,
  type CreateProductGuideStep,
} from '@/lib/vendor/create-product-guide';

/**
 * Continues the empty-catalog “add product” spotlight through the create wizard.
 * Active while sessionStorage flag is set (started from products empty CTA / tours hub).
 */
export function CreateProductGuideSpotlight({ step }: { step: CreateProductGuideStep }) {
  const { isActive: productTourActive } = useProductTour();
  const [open, setOpen] = useState(false);
  const tip = getCreateProductGuideTip(step);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(isCreateProductGuideActive() && !productTourActive && tip != null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [step, productTourActive, tip]);

  const dismiss = useCallback(() => {
    setOpen(false);
    if (step === 4) {
      clearCreateProductGuide();
    }
  }, [step]);

  if (!open || !tip) return null;

  return (
    <FeatureSpotlightOverlay
      targetId={tip.targetId}
      title={tip.title}
      body={tip.body}
      primaryLabel={tip.primaryLabel}
      onPrimary={dismiss}
      onSkip={() => {
        clearCreateProductGuide();
        setOpen(false);
      }}
    />
  );
}
