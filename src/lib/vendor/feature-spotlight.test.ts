import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  FEATURE_SPOTLIGHT_STORAGE_PREFIX,
  FEATURE_SPOTLIGHT_VERSION,
  clearFeatureSpotlightState,
  featureSpotlightStorageKey,
  hasDismissedFeatureSpotlight,
  readFeatureSpotlightState,
  shouldShowFeatureSpotlight,
  writeFeatureSpotlightState,
} from './feature-spotlight';

describe('feature spotlight storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('keys by user and feature id', () => {
    expect(featureSpotlightStorageKey('u1', 'products-empty-add')).toBe(
      `${FEATURE_SPOTLIGHT_STORAGE_PREFIX}:u1:products-empty-add`,
    );
  });

  it('writes and reads dismissed state', () => {
    writeFeatureSpotlightState('u1', 'products-empty-add', 'completed');
    expect(readFeatureSpotlightState('u1', 'products-empty-add')).toEqual({
      status: 'completed',
      version: FEATURE_SPOTLIGHT_VERSION,
    });
    expect(hasDismissedFeatureSpotlight('u1', 'products-empty-add')).toBe(true);
  });

  it('ignores mismatched version', () => {
    window.localStorage.setItem(
      featureSpotlightStorageKey('u1', 'products-empty-add'),
      JSON.stringify({ status: 'skipped', version: FEATURE_SPOTLIGHT_VERSION - 1 }),
    );
    expect(readFeatureSpotlightState('u1', 'products-empty-add')).toBeNull();
  });

  it('clears state for replay', () => {
    writeFeatureSpotlightState('u1', 'products-empty-add', 'skipped');
    clearFeatureSpotlightState('u1', 'products-empty-add');
    expect(hasDismissedFeatureSpotlight('u1', 'products-empty-add')).toBe(false);
  });
});

describe('shouldShowFeatureSpotlight', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows when eligible and not dismissed', () => {
    expect(
      shouldShowFeatureSpotlight({
        userId: 'u1',
        featureId: 'products-empty-add',
        eligible: true,
      }),
    ).toBe(true);
  });

  it('hides when ineligible, blocked, or dismissed', () => {
    expect(
      shouldShowFeatureSpotlight({
        userId: 'u1',
        featureId: 'products-empty-add',
        eligible: false,
      }),
    ).toBe(false);
    expect(
      shouldShowFeatureSpotlight({
        userId: 'u1',
        featureId: 'products-empty-add',
        eligible: true,
        blockedByOtherTour: true,
      }),
    ).toBe(false);

    writeFeatureSpotlightState('u1', 'products-empty-add', 'skipped');
    expect(
      shouldShowFeatureSpotlight({
        userId: 'u1',
        featureId: 'products-empty-add',
        eligible: true,
      }),
    ).toBe(false);
  });
});
