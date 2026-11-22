import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  PRODUCT_TOUR_STORAGE_PREFIX,
  PRODUCT_TOUR_VERSION,
  clearProductTourPersistedState,
  getProductTourStepsForRole,
  hasCompletedOrSkippedProductTour,
  productTourStorageKey,
  readProductTourPersistedState,
  resolveProductTourPath,
  resolveProductTourRole,
  shouldAutoStartProductTour,
  writeProductTourPersistedState,
} from './product-tour';

describe('resolveProductTourRole / path', () => {
  it('resolves owner over manager', () => {
    expect(resolveProductTourRole({ isOwner: true, isManager: true })).toBe('owner');
    expect(resolveProductTourPath('owner')).toBe('owner');
  });

  it('resolves manager when not owner', () => {
    expect(resolveProductTourRole({ isOwner: false, isManager: true })).toBe('manager');
    expect(resolveProductTourPath('manager')).toBe('member');
  });

  it('resolves staff otherwise', () => {
    expect(resolveProductTourRole({ isOwner: false, isManager: false })).toBe('staff');
    expect(resolveProductTourPath('staff')).toBe('member');
  });
});

describe('getProductTourStepsForRole', () => {
  it('includes day-to-day steps for staff without owner-only items', () => {
    const ids = getProductTourStepsForRole('staff').map((step) => step.id);
    expect(ids).toContain('orders');
    expect(ids).toContain('products');
    expect(ids).toContain('help');
    expect(ids).not.toContain('team');
    expect(ids).not.toContain('payout');
    expect(ids).not.toContain('api');
    expect(ids).not.toContain('owner-next');
  });

  it('adds api for manager', () => {
    const ids = getProductTourStepsForRole('manager').map((step) => step.id);
    expect(ids).toContain('api');
    expect(ids).not.toContain('team');
    expect(ids).not.toContain('payout');
    expect(ids).not.toContain('owner-next');
  });

  it('includes owner-only steps and next-actions for owner', () => {
    const steps = getProductTourStepsForRole('owner');
    const ids = steps.map((step) => step.id);
    expect(ids).toContain('team');
    expect(ids).toContain('payout');
    expect(ids).toContain('api');
    expect(ids).toContain('owner-next');
    expect(steps.find((step) => step.id === 'owner-next')?.kind).toBe('next-actions');
  });
});

describe('product tour localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('builds storage key with user and path', () => {
    expect(productTourStorageKey('u1', 'member')).toBe(`${PRODUCT_TOUR_STORAGE_PREFIX}:u1:member`);
  });

  it('writes and reads completed state', () => {
    writeProductTourPersistedState('u1', 'owner', 'completed');
    expect(readProductTourPersistedState('u1', 'owner')).toEqual({
      status: 'completed',
      version: PRODUCT_TOUR_VERSION,
    });
    expect(hasCompletedOrSkippedProductTour('u1', 'owner')).toBe(true);
    expect(hasCompletedOrSkippedProductTour('u1', 'member')).toBe(false);
  });

  it('ignores mismatched version', () => {
    window.localStorage.setItem(
      productTourStorageKey('u1', 'member'),
      JSON.stringify({ status: 'completed', version: PRODUCT_TOUR_VERSION - 1 }),
    );
    expect(readProductTourPersistedState('u1', 'member')).toBeNull();
  });

  it('clears persisted state for replay', () => {
    writeProductTourPersistedState('u1', 'member', 'skipped');
    clearProductTourPersistedState('u1', 'member');
    expect(readProductTourPersistedState('u1', 'member')).toBeNull();
  });
});

describe('shouldAutoStartProductTour', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts on first vendor dashboard visit with a store', () => {
    expect(
      shouldAutoStartProductTour({
        userId: 'u1',
        hasStores: true,
        isSuspended: false,
        pathname: '/vendor',
        path: 'member',
      }),
    ).toBe(true);
  });

  it('does not start without user, stores, or when suspended', () => {
    expect(
      shouldAutoStartProductTour({
        userId: null,
        hasStores: true,
        isSuspended: false,
        pathname: '/vendor',
        path: 'member',
      }),
    ).toBe(false);
    expect(
      shouldAutoStartProductTour({
        userId: 'u1',
        hasStores: false,
        isSuspended: false,
        pathname: '/vendor',
        path: 'member',
      }),
    ).toBe(false);
    expect(
      shouldAutoStartProductTour({
        userId: 'u1',
        hasStores: true,
        isSuspended: true,
        pathname: '/vendor',
        path: 'member',
      }),
    ).toBe(false);
  });

  it('does not start on onboarding or after dismiss', () => {
    expect(
      shouldAutoStartProductTour({
        userId: 'u1',
        hasStores: true,
        isSuspended: false,
        pathname: '/vendor/onboarding',
        path: 'owner',
      }),
    ).toBe(false);

    writeProductTourPersistedState('u1', 'owner', 'skipped');
    expect(
      shouldAutoStartProductTour({
        userId: 'u1',
        hasStores: true,
        isSuspended: false,
        pathname: '/vendor/orders',
        path: 'owner',
      }),
    ).toBe(false);
  });
});
