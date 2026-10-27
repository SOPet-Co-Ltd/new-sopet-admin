import { describe, expect, it } from 'vitest';
import { buildStoreReadinessChecklist, isPayoutSetupComplete } from './store-readiness';

describe('isPayoutSetupComplete', () => {
  it('treats unverified and rejected as incomplete', () => {
    expect(isPayoutSetupComplete('unverified')).toBe(false);
    expect(isPayoutSetupComplete('rejected')).toBe(false);
    expect(isPayoutSetupComplete(undefined)).toBe(false);
  });

  it('treats pending_review and verified as complete', () => {
    expect(isPayoutSetupComplete('pending_review')).toBe(true);
    expect(isPayoutSetupComplete('verified')).toBe(true);
  });
});

describe('buildStoreReadinessChecklist', () => {
  it('marks incomplete items until requirements are met', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [],
      products: [{ status: 'draft' }],
      bankAccountVerificationStatus: 'unverified',
    });

    expect(checklist.allComplete).toBe(false);
    expect(checklist.completedCount).toBe(0);
    expect(checklist.items.map((item) => item.complete)).toEqual([false, false, false]);
  });

  it('marks all complete when shipping, published product, and payout are ready', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [{ id: 'ship-1' } as never],
      products: [{ status: 'published' }],
      bankAccountVerificationStatus: 'verified',
    });

    expect(checklist.allComplete).toBe(true);
    expect(checklist.completedCount).toBe(3);
  });
});
