'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { SpotlightOverlay } from '@/components/vendor/product-tour/spotlight-overlay';
import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreManager, useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStoreShippingOptions } from '@/hooks/useShipping';
import { useMyStore } from '@/hooks/useStoreSettings';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { buildStoreReadinessChecklist } from '@/lib/stores/store-readiness';
import {
  clearProductTourPersistedState,
  getProductTourStepsForRole,
  resolveProductTourPath,
  resolveProductTourRole,
  shouldAutoStartProductTour,
  writeProductTourPersistedState,
  type ProductTourPath,
} from '@/lib/vendor/product-tour';

type ProductTourContextValue = {
  startTour: () => void;
  isActive: boolean;
};

const ProductTourContext = createContext<ProductTourContextValue | null>(null);

export function useProductTour(): ProductTourContextValue {
  const ctx = useContext(ProductTourContext);
  if (!ctx) {
    return {
      startTour: () => undefined,
      isActive: false,
    };
  }
  return ctx;
}

export function ProductTourProvider({
  hasStores,
  isSuspended,
  onMobileNavOpenChange,
  children,
}: {
  hasStores: boolean;
  isSuspended: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const { isManager } = useIsStoreManager();

  const tourRole = resolveProductTourRole({
    isOwner,
    // Hook treats owners as managers; keep manager-only for non-owners.
    isManager: isManager && !isOwner,
  });
  const path: ProductTourPath = resolveProductTourPath(tourRole);
  const steps = useMemo(() => getProductTourStepsForRole(tourRole), [tourRole]);

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoChecked, setAutoChecked] = useState(false);

  const { data: store } = useMyStore();
  const { data: shippingOptions = [] } = useMyStoreShippingOptions(hasStores && isOwner);
  const { data: productsResult } = useVendorProducts(
    { limit: 50 },
    { enabled: hasStores && isOwner },
  );

  const readiness = useMemo(() => {
    if (!isOwner) return null;
    return buildStoreReadinessChecklist({
      shippingOptions,
      products: productsResult?.items ?? [],
      omiseRecipientStatus: store?.omiseRecipientStatus,
    });
  }, [isOwner, shippingOptions, productsResult?.items, store?.omiseRecipientStatus]);

  const startTour = useCallback(() => {
    if (!user?.id || steps.length === 0) return;
    clearProductTourPersistedState(user.id, path);
    setStepIndex(0);
    setActive(true);
    onMobileNavOpenChange?.(true);
  }, [user, steps.length, path, onMobileNavOpenChange]);

  const finishWithStatus = useCallback(
    (status: 'completed' | 'skipped') => {
      if (user?.id) {
        writeProductTourPersistedState(user.id, path, status);
      }
      setActive(false);
      setStepIndex(0);
      onMobileNavOpenChange?.(false);
    },
    [user, path, onMobileNavOpenChange],
  );

  useEffect(() => {
    if (autoChecked || !user?.id || !hasStores) return;
    const shouldStart = shouldAutoStartProductTour({
      userId: user.id,
      hasStores,
      isSuspended,
      pathname,
      path,
    });
    const timer = window.setTimeout(() => {
      if (shouldStart) {
        setStepIndex(0);
        setActive(true);
        onMobileNavOpenChange?.(true);
      }
      setAutoChecked(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoChecked, user, hasStores, isSuspended, pathname, path, onMobileNavOpenChange]);

  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) {
      const timer = window.setTimeout(() => finishWithStatus('completed'), 0);
      return () => window.clearTimeout(timer);
    }
    if (!step.targetId) return;

    const timer = window.setTimeout(() => {
      const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
      if (el) return;
      if (stepIndex < steps.length - 1) {
        setStepIndex((current) => current + 1);
      } else {
        finishWithStatus('completed');
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [active, stepIndex, steps, finishWithStatus]);

  const currentStep = steps[stepIndex];

  const value = useMemo(
    () => ({
      startTour,
      isActive: active,
    }),
    [startTour, active],
  );

  return (
    <ProductTourContext.Provider value={value}>
      {children}
      {active && currentStep ? (
        <SpotlightOverlay
          step={currentStep}
          stepIndex={stepIndex}
          stepCount={steps.length}
          readiness={readiness}
          onBack={() => setStepIndex((current) => Math.max(0, current - 1))}
          onNext={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
          onSkip={() => finishWithStatus('skipped')}
          onFinish={() => finishWithStatus('completed')}
        />
      ) : null}
    </ProductTourContext.Provider>
  );
}
