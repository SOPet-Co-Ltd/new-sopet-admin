/**
 * Red foundation for store-commission display helpers (frontend-task-01 / P0-T2).
 * Green implementation is frontend-task-03 — do not add commission-display.ts
 * or AdminStoreCommissionField here.
 *
 * Helpers are required at call time (not suite load) so Vitest names each row
 * when the module is missing or empty. Vite static-analyzes `import('./missing')`.
 */
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

type IsCustomCommissionRate = (rate: number | null | undefined) => boolean;

type NumberRegisterOptions = {
  setValueAs: (value: unknown) => number | undefined;
};

function loadIsCustomCommissionRate(): IsCustomCommissionRate {
  const mod = require('./commission-display') as {
    isCustomCommissionRate?: IsCustomCommissionRate;
  };
  if (!mod.isCustomCommissionRate) {
    throw new Error('isCustomCommissionRate is not exported');
  }
  return mod.isCustomCommissionRate;
}

function loadNumberRegisterOptions(): NumberRegisterOptions {
  const mod = require('../../components/admin/admin-store-commission-field') as {
    numberRegisterOptions?: NumberRegisterOptions;
  };
  if (!mod.numberRegisterOptions?.setValueAs) {
    throw new Error('numberRegisterOptions.setValueAs is not exported');
  }
  return mod.numberRegisterOptions;
}

describe('isCustomCommissionRate', () => {
  it('returns false for null (platform default, hint.default)', () => {
    expect(loadIsCustomCommissionRate()(null)).toBe(false);
  });

  it('returns false for undefined (platform default, hint.default)', () => {
    expect(loadIsCustomCommissionRate()(undefined)).toBe(false);
  });

  it('returns true for 0 (saved custom no take-rate, hint.custom)', () => {
    expect(loadIsCustomCommissionRate()(0)).toBe(true);
  });

  it('returns true for 7 (saved custom, not platform default)', () => {
    expect(loadIsCustomCommissionRate()(7)).toBe(true);
  });
});

describe('numberRegisterOptions.setValueAs', () => {
  it('setValueAs("7") → 7', () => {
    const result = loadNumberRegisterOptions().setValueAs('7');
    expect(result).toBe(7);
    expect(typeof result).toBe('number');
  });
});
