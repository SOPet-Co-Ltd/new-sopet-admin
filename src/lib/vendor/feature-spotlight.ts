export const FEATURE_SPOTLIGHT_VERSION = 1;

export const FEATURE_SPOTLIGHT_STORAGE_PREFIX = 'sopet-vendor-feature-spotlight';

/** Stable ids for page-level spotlights across vendor routes. */
export type FeatureSpotlightId =
  | 'products-empty-add'
  | 'customers-empty-intro'
  | 'reviews-empty-intro'
  | 'promotions-empty-add'
  | 'campaigns-empty-add'
  | 'team-invite'
  | 'payout-setup'
  | 'stores-request'
  | 'requests-inbox';

export type FeatureSpotlightStatus = 'completed' | 'skipped';

export type FeatureSpotlightPersistedState = {
  status: FeatureSpotlightStatus;
  version: number;
};

export function featureSpotlightStorageKey(userId: string, featureId: FeatureSpotlightId): string {
  return `${FEATURE_SPOTLIGHT_STORAGE_PREFIX}:${userId}:${featureId}`;
}

export function readFeatureSpotlightState(
  userId: string,
  featureId: FeatureSpotlightId,
): FeatureSpotlightPersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(featureSpotlightStorageKey(userId, featureId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FeatureSpotlightPersistedState>;
    if (parsed.status !== 'completed' && parsed.status !== 'skipped') return null;
    if (parsed.version !== FEATURE_SPOTLIGHT_VERSION) return null;
    return { status: parsed.status, version: FEATURE_SPOTLIGHT_VERSION };
  } catch {
    return null;
  }
}

export function writeFeatureSpotlightState(
  userId: string,
  featureId: FeatureSpotlightId,
  status: FeatureSpotlightStatus,
): void {
  if (typeof window === 'undefined') return;
  const state: FeatureSpotlightPersistedState = {
    status,
    version: FEATURE_SPOTLIGHT_VERSION,
  };
  window.localStorage.setItem(featureSpotlightStorageKey(userId, featureId), JSON.stringify(state));
}

export function clearFeatureSpotlightState(userId: string, featureId: FeatureSpotlightId): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(featureSpotlightStorageKey(userId, featureId));
}

export function hasDismissedFeatureSpotlight(
  userId: string,
  featureId: FeatureSpotlightId,
): boolean {
  return readFeatureSpotlightState(userId, featureId) != null;
}

export function shouldShowFeatureSpotlight(input: {
  userId: string | null | undefined;
  featureId: FeatureSpotlightId;
  /** Domain condition (e.g. empty catalog, first eligible visit). */
  eligible: boolean;
  /** Pause when another tour overlay is already active. */
  blockedByOtherTour?: boolean;
}): boolean {
  if (!input.userId) return false;
  if (!input.eligible) return false;
  if (input.blockedByOtherTour) return false;
  return !hasDismissedFeatureSpotlight(input.userId, input.featureId);
}
