'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FeatureSpotlight } from '@/components/vendor/product-tour/feature-spotlight';
import {
  getPageFeatureSpotlight,
  type PageFeatureSpotlightConfig,
} from '@/lib/vendor/page-feature-spotlights';
import type { FeatureSpotlightId } from '@/lib/vendor/feature-spotlight';

type PageSpotlightId = Exclude<FeatureSpotlightId, 'products-empty-add'>;

function useForcedPageSpotlight(featureId: PageSpotlightId): {
  force: boolean;
  clearForce: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const force = searchParams.get('spotlight') === featureId;

  const clearForce = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('spotlight');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  return { force, clearForce };
}

function PageFeatureSpotlightInner({
  featureId,
  eligible,
  onCompleted,
}: {
  featureId: PageSpotlightId;
  eligible: boolean;
  onCompleted?: () => void;
}) {
  const router = useRouter();
  const { force, clearForce } = useForcedPageSpotlight(featureId);
  const config: PageFeatureSpotlightConfig = getPageFeatureSpotlight(featureId);

  if (!eligible && !force) return null;

  return (
    <FeatureSpotlight
      featureId={featureId}
      eligible={eligible || force}
      force={force}
      targetId={config.targetId}
      title={config.title}
      body={config.body}
      primaryLabel={config.primaryLabel}
      onForcedDismiss={clearForce}
      onCompleted={() => {
        // Start action guides (session) before navigate so the next page sees active state.
        onCompleted?.();
        if (config.completeHref) {
          router.push(config.completeHref);
        }
      }}
    />
  );
}

/**
 * First-visit / empty-state spotlight for a vendor page, with tours-hub force replay.
 */
export function PageFeatureSpotlight(props: {
  featureId: PageSpotlightId;
  eligible: boolean;
  onCompleted?: () => void;
}) {
  return (
    <Suspense fallback={null}>
      <PageFeatureSpotlightInner {...props} />
    </Suspense>
  );
}
