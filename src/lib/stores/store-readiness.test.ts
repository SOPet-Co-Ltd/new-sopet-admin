import { describe, expect, it } from 'vitest';
import { buildStoreReadinessChecklist, isPayoutSetupComplete } from './store-readiness';

describe('isPayoutSetupComplete', () => {
  it('treats missing bank fields as incomplete', () => {
    expect(isPayoutSetupComplete(undefined)).toBe(false);
    expect(isPayoutSetupComplete({})).toBe(false);
    expect(
      isPayoutSetupComplete({
        bankName: 'ธนาคารกสิกรไทย',
        bankAccountName: 'Store Owner',
      }),
    ).toBe(false);
  });

  it('treats a complete bank account as ready', () => {
    expect(
      isPayoutSetupComplete({
        bankName: 'ธนาคารกสิกรไทย',
        bankAccountName: 'Store Owner',
        bankAccountNumber: '1234567890',
      }),
    ).toBe(true);
  });
});

describe('buildStoreReadinessChecklist', () => {
  it('marks incomplete items until requirements are met', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [],
      products: [{ status: 'draft' }],
    });

    expect(checklist.allComplete).toBe(false);
    expect(checklist.completedCount).toBe(0);
    expect(checklist.items.map((item) => item.complete)).toEqual([false, false, false]);
  });

  it('marks all complete when shipping, published product, and payout are ready', () => {
    const checklist = buildStoreReadinessChecklist({
      shippingOptions: [{ id: 'ship-1' } as never],
      products: [{ status: 'published' }],
      bankName: 'ธนาคารกสิกรไทย',
      bankAccountName: 'Store Owner',
      bankAccountNumber: '1234567890',
    });

    expect(checklist.allComplete).toBe(true);
    expect(checklist.completedCount).toBe(3);
  });
});
