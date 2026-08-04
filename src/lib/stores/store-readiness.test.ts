import { describe, expect, it } from 'vitest';
import { buildStoreReadinessChecklist, isPayoutSetupComplete } from './store-readiness';

describe('isPayoutSetupComplete', () => {
  it('treats not_connected and failed as incomplete', () => {
    expect(isPayoutSetupComplete('not_connected')).toBe(false);
    expect(isPayoutSetupComplete('failed')).toBe(false);
    expect(isPayoutSetupComplete(undefined)).toBe(false);
  });

  it('treats pending and active as complete', () => {
    expect(isPayoutSetupComplete('pending')).toBe(true);
    expect(isPayoutSetupComplete('active')).toBe(true);
  });
});

describe('buildStoreReadinessChecklist', () => {
  it('marks incomplete items until requirements are met', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [],
      products: [{ status: 'draft' }],
      omiseRecipientStatus: 'not_connected',
    });

    expect(checklist.allComplete).toBe(false);
    expect(checklist.completedCount).toBe(0);
    expect(checklist.items.map((item) => item.complete)).toEqual([false, false, false]);
  });

  it('marks all complete when shipping, published product, and payout are ready', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [{ id: 'ship-1' } as never],
      products: [{ status: 'published' }],
      omiseRecipientStatus: 'active',
    });

    expect(checklist.allComplete).toBe(true);
    expect(checklist.completedCount).toBe(3);
  });
});
