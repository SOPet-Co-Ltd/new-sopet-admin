import { describe, expect, it } from 'vitest';
import {
  formatThaiBankAccountNumber,
  sanitizeBankAccountDigits,
} from './formatThaiBankAccountNumber';

describe('formatThaiBankAccountNumber', () => {
  it('formats progressive input as xxx-x-xxxxx-x', () => {
    expect(formatThaiBankAccountNumber('1')).toBe('1');
    expect(formatThaiBankAccountNumber('123')).toBe('123');
    expect(formatThaiBankAccountNumber('1234')).toBe('123-4');
    expect(formatThaiBankAccountNumber('123456789')).toBe('123-4-56789');
    expect(formatThaiBankAccountNumber('1234567890')).toBe('123-4-56789-0');
  });

  it('strips non-digits and caps length', () => {
    expect(formatThaiBankAccountNumber('123-4-56789-0')).toBe('123-4-56789-0');
    expect(sanitizeBankAccountDigits('12a3b456789012345678')).toBe('123456789012345');
    expect(formatThaiBankAccountNumber('123456789012345')).toBe('123-4-56789-012345');
  });
});
