import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  clearOnboardingPersistedState,
  getInPhaseChecklist,
  getOnboardingPhase,
  getOnboardingStepNumber,
  getOnboardingStepperSteps,
  getPhaseRailState,
  ONBOARDING_STORAGE_KEY,
  readOnboardingPersistedState,
  resolveOnboardingStep,
  shouldShowOnboardingResumeBanner,
  writeOnboardingPersistedState,
  type ResolveOnboardingStepInput,
} from './onboarding';

function baseInput(
  overrides: Partial<ResolveOnboardingStepInput> = {},
): ResolveOnboardingStepInput {
  return {
    emailVerified: true,
    path: null,
    hasPendingStoreRequest: false,
    hasStores: false,
    isOwner: false,
    readiness: { shipping: false, publishedProduct: false, payout: false },
    skippedSetup: false,
    acknowledgedStoreProfile: false,
    acknowledgedProduct: false,
    ...overrides,
  };
}

describe('resolveOnboardingStep', () => {
  it('returns verify when email is not verified', () => {
    expect(resolveOnboardingStep(baseInput({ emailVerified: false, path: 'create' }))).toBe(
      'verify',
    );
  });

  it('returns choose when path is unset', () => {
    expect(resolveOnboardingStep(baseInput())).toBe('choose');
  });

  it('create path: create-request when no stores and no pending request', () => {
    expect(resolveOnboardingStep(baseInput({ path: 'create' }))).toBe('create-request');
  });

  it('create path: waiting when pending request and no stores', () => {
    expect(resolveOnboardingStep(baseInput({ path: 'create', hasPendingStoreRequest: true }))).toBe(
      'waiting',
    );
  });

  it('create path: store-profile when owner has store and nothing acknowledged', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
        }),
      ),
    ).toBe('store-profile');
  });

  it('create path: shipping after store profile acknowledged', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          acknowledgedStoreProfile: true,
        }),
      ),
    ).toBe('shipping');
  });

  it('create path: skips store-profile when readiness already started', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          readiness: { shipping: true, publishedProduct: false, payout: false },
        }),
      ),
    ).toBe('payout');
  });

  it('create path: payout after shipping complete', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          acknowledgedStoreProfile: true,
          readiness: { shipping: true, publishedProduct: false, payout: false },
        }),
      ),
    ).toBe('payout');
  });

  it('create path: first-product after payout complete', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          acknowledgedStoreProfile: true,
          readiness: { shipping: true, publishedProduct: false, payout: true },
        }),
      ),
    ).toBe('first-product');
  });

  it('create path: done when all readiness complete', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          acknowledgedStoreProfile: true,
          readiness: { shipping: true, publishedProduct: true, payout: true },
        }),
      ),
    ).toBe('done');
  });

  it('create path: done when product acknowledged without published product', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          acknowledgedStoreProfile: true,
          acknowledgedProduct: true,
          readiness: { shipping: true, publishedProduct: false, payout: true },
        }),
      ),
    ).toBe('done');
  });

  it('create path: done when skippedSetup', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: true,
          skippedSetup: true,
        }),
      ),
    ).toBe('done');
  });

  it('join path: join-accept without stores', () => {
    expect(resolveOnboardingStep(baseInput({ path: 'join' }))).toBe('join-accept');
  });

  it('join path: join-done with stores', () => {
    expect(resolveOnboardingStep(baseInput({ path: 'join', hasStores: true }))).toBe('join-done');
  });

  it('create path with stores but non-owner lands on join-done', () => {
    expect(
      resolveOnboardingStep(
        baseInput({
          path: 'create',
          hasStores: true,
          isOwner: false,
        }),
      ),
    ).toBe('join-done');
  });
});

describe('shouldShowOnboardingResumeBanner', () => {
  it('shows for owner with incomplete readiness', () => {
    expect(
      shouldShowOnboardingResumeBanner({
        hasStores: true,
        isOwner: true,
        skippedSetup: false,
        readiness: { shipping: false, publishedProduct: false, payout: false },
      }),
    ).toBe(true);
  });

  it('hides when skipped or complete', () => {
    expect(
      shouldShowOnboardingResumeBanner({
        hasStores: true,
        isOwner: true,
        skippedSetup: true,
        readiness: { shipping: false, publishedProduct: false, payout: false },
      }),
    ).toBe(false);
    expect(
      shouldShowOnboardingResumeBanner({
        hasStores: true,
        isOwner: true,
        skippedSetup: false,
        readiness: { shipping: true, publishedProduct: true, payout: true },
      }),
    ).toBe(false);
  });
});

describe('stepper helpers', () => {
  it('returns create steps by default', () => {
    expect(getOnboardingStepperSteps(null)).toHaveLength(9);
    expect(getOnboardingStepperSteps('create')).toHaveLength(9);
    expect(getOnboardingStepperSteps('join')).toHaveLength(4);
  });

  it('maps step numbers for create and join', () => {
    expect(getOnboardingStepNumber('waiting', 'create')).toBe(4);
    expect(getOnboardingStepNumber('join-accept', 'join')).toBe(3);
    expect(getOnboardingStepNumber('join-done', 'join')).toBe(4);
  });
});

describe('phase helpers', () => {
  it('maps create steps to phases', () => {
    expect(getOnboardingPhase('verify', 'create')).toBe(1);
    expect(getOnboardingPhase('choose', null)).toBe(2);
    expect(getOnboardingPhase('waiting', 'create')).toBe(2);
    expect(getOnboardingPhase('shipping', 'create')).toBe(3);
    expect(getOnboardingPhase('done', 'create')).toBe(3);
  });

  it('maps join steps to phases', () => {
    expect(getOnboardingPhase('join-accept', 'join')).toBe(2);
    expect(getOnboardingPhase('join-done', 'join')).toBe(3);
  });

  it('builds phase rail statuses for waiting', () => {
    const rail = getPhaseRailState('waiting', 'create');
    expect(rail.map((p) => p.label)).toEqual(['บัญชี', 'ได้ร้าน', 'พร้อมขาย']);
    expect(rail.map((p) => p.status)).toEqual(['complete', 'current', 'upcoming']);
  });

  it('builds in-phase checklist with prior tasks complete', () => {
    const checklist = getInPhaseChecklist('waiting', 'create');
    expect(checklist.map((item) => item.label)).toEqual(['เลือกทาง', 'ขอเปิดร้าน', 'รออนุมัติ']);
    expect(checklist.map((item) => item.status)).toEqual(['complete', 'complete', 'current']);
  });

  it('builds join phase-2 checklist', () => {
    const checklist = getInPhaseChecklist('join-accept', 'join');
    expect(checklist.map((item) => item.label)).toEqual(['เลือกทาง', 'เข้าร่วมร้าน']);
    expect(checklist.map((item) => item.status)).toEqual(['complete', 'current']);
  });
});

describe('onboarding localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads defaults when empty', () => {
    expect(readOnboardingPersistedState()).toEqual({ path: null, skippedSetup: false });
  });

  it('round-trips path and skippedSetup', () => {
    writeOnboardingPersistedState({ path: 'create', skippedSetup: true });
    expect(readOnboardingPersistedState()).toEqual({ path: 'create', skippedSetup: true });
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toContain('create');
  });

  it('clears persisted state', () => {
    writeOnboardingPersistedState({ path: 'join', skippedSetup: false });
    clearOnboardingPersistedState();
    expect(readOnboardingPersistedState()).toEqual({ path: null, skippedSetup: false });
  });
});
