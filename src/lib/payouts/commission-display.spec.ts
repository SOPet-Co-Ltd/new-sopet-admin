/**
 * Loaders stay call-time so a missing export still names the failing row.
 */
import { describe, expect, it } from 'vitest';

type IsCustomCommissionRate = (rate: number | null | undefined) => boolean;

type NumberRegisterOptions = {
  setValueAs: (value: unknown) => number | undefined;
};

async function loadIsCustomCommissionRate(): Promise<IsCustomCommissionRate> {
  const mod = (await import('./commission-display')) as {
    isCustomCommissionRate?: IsCustomCommissionRate;
  };
  if (!mod.isCustomCommissionRate) {
    throw new Error('isCustomCommissionRate is not exported');
  }
  return mod.isCustomCommissionRate;
}

async function loadNumberRegisterOptions(): Promise<NumberRegisterOptions> {
  const mod = (await import('../../components/admin/admin-store-commission-field')) as {
    numberRegisterOptions?: NumberRegisterOptions;
  };
  if (!mod.numberRegisterOptions?.setValueAs) {
    throw new Error('numberRegisterOptions.setValueAs is not exported');
  }
  return mod.numberRegisterOptions;
}

describe('isCustomCommissionRate', () => {
  it('returns false for null (platform default, hint.default)', async () => {
    expect((await loadIsCustomCommissionRate())(null)).toBe(false);
  });

  it('returns false for undefined (platform default, hint.default)', async () => {
    expect((await loadIsCustomCommissionRate())(undefined)).toBe(false);
  });

  it('returns true for 0 (saved custom no take-rate, hint.custom)', async () => {
    expect((await loadIsCustomCommissionRate())(0)).toBe(true);
  });

  it('returns true for 7 (saved custom, not platform default)', async () => {
    expect((await loadIsCustomCommissionRate())(7)).toBe(true);
  });
});

type FormatBreakdownAmount = (value: number) => string;

async function loadFormatBreakdownAmount(): Promise<FormatBreakdownAmount> {
  const mod = (await import('./commission-display')) as {
    formatBreakdownAmount?: FormatBreakdownAmount;
  };
  if (!mod.formatBreakdownAmount) {
    throw new Error('formatBreakdownAmount is not exported');
  }
  return mod.formatBreakdownAmount;
}

describe('formatBreakdownAmount', () => {
  it('formats a fixture amount with formatCurrency (th-TH / THB)', async () => {
    const { formatCurrency } = await import('../utils');
    expect((await loadFormatBreakdownAmount())(1410)).toBe(formatCurrency(1410));
    expect((await loadFormatBreakdownAmount())(70)).toBe(formatCurrency(70));
  });
});

describe('numberRegisterOptions.setValueAs', () => {
  it('setValueAs("7") → 7', async () => {
    const result = (await loadNumberRegisterOptions()).setValueAs('7');
    expect(result).toBe(7);
    expect(typeof result).toBe('number');
  });
});
