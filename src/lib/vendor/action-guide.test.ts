import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACTION_GUIDE_CHANGE_EVENT,
  ACTION_GUIDE_STORAGE_KEY,
  actionGuideHref,
  advanceActionGuide,
  clearActionGuide,
  getActionGuideLastStep,
  getActionGuideTip,
  isActionGuideActive,
  markActionGuideSeen,
  readActionGuideState,
  startActionGuide,
} from './action-guide';

describe('action-guide', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('starts and clears a named guide', () => {
    expect(isActionGuideActive('create-promotion')).toBe(false);
    expect(startActionGuide('create-promotion')).toBe(true);
    expect(isActionGuideActive('create-promotion')).toBe(true);
    expect(isActionGuideActive('create-campaign')).toBe(false);
    clearActionGuide();
    expect(isActionGuideActive('create-promotion')).toBe(false);
  });

  it('refuses to auto-start after seen unless force', () => {
    markActionGuideSeen('u1', 'create-promotion');
    expect(startActionGuide('create-promotion', { userId: 'u1' })).toBe(false);
    expect(isActionGuideActive('create-promotion')).toBe(false);
    expect(startActionGuide('create-promotion', { userId: 'u1', force: true })).toBe(true);
    expect(isActionGuideActive('create-promotion')).toBe(true);
  });

  it('dispatches change event on start, advance, and clear', () => {
    const listener = vi.fn();
    window.addEventListener(ACTION_GUIDE_CHANGE_EVENT, listener);

    startActionGuide('invite-team');
    expect(listener).toHaveBeenCalledTimes(1);

    advanceActionGuide();
    expect(listener).toHaveBeenCalledTimes(2);

    clearActionGuide();
    expect(listener).toHaveBeenCalledTimes(3);

    window.removeEventListener(ACTION_GUIDE_CHANGE_EVENT, listener);
  });

  it('starts at step 1', () => {
    startActionGuide('create-promotion');
    expect(readActionGuideState().step).toBe(1);
  });

  it('advanceActionGuide moves to step 2', () => {
    startActionGuide('create-promotion');
    advanceActionGuide();
    expect(readActionGuideState().step).toBe(2);
    expect(isActionGuideActive('create-promotion')).toBe(true);
  });

  it('advancing past last step clears', () => {
    startActionGuide('invite-team');
    advanceActionGuide();
    advanceActionGuide();
    expect(readActionGuideState().step).toBe(3);
    advanceActionGuide();
    expect(isActionGuideActive('invite-team')).toBe(false);
    expect(readActionGuideState().active).toBe(false);
  });

  it('builds href with guide query', () => {
    expect(actionGuideHref('/vendor/promotions/new', 'create-promotion')).toBe(
      '/vendor/promotions/new?guide=create-promotion',
    );
    expect(actionGuideHref('/vendor/settings?tab=payout', 'setup-payout')).toBe(
      '/vendor/settings?tab=payout&guide=setup-payout',
    );
  });

  it('returns tips for each guide', () => {
    expect(getActionGuideTip('create-promotion', 1)?.targetId).toBe('action-promo-type');
    expect(getActionGuideTip('create-campaign', 4)?.primaryLabel).toBe('เสร็จสิ้น');
    expect(getActionGuideTip('invite-team', 3)?.targetId).toBe('action-team-submit');
    expect(getActionGuideTip('request-store', 1)?.targetId).toBe('action-store-name');
    expect(getActionGuideTip('setup-payout', 3)?.targetId).toBe('action-payout-omise');
  });

  it('defaults step to 1 for legacy storage without step', () => {
    sessionStorage.setItem(
      ACTION_GUIDE_STORAGE_KEY,
      JSON.stringify({ active: true, id: 'create-promotion' }),
    );
    const state = readActionGuideState();
    expect(state.active).toBe(true);
    expect(state.id).toBe('create-promotion');
    expect(state.step).toBe(1);
  });

  it('treats unknown stored id as inactive', () => {
    sessionStorage.setItem(
      ACTION_GUIDE_STORAGE_KEY,
      JSON.stringify({ active: true, id: 'create-product', step: 1 }),
    );
    expect(readActionGuideState()).toEqual({ active: false, id: null, step: 0 });
    expect(isActionGuideActive('create-promotion')).toBe(false);
  });

  it('getActionGuideLastStep returns final step count per guide', () => {
    expect(getActionGuideLastStep('create-promotion')).toBe(5);
    expect(getActionGuideLastStep('invite-team')).toBe(3);
  });
});
