import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  payoutFormSchema,
  productFormSchema,
  registerVendorSchema,
  resetPasswordSchema,
} from './index';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@sopet.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email with Thai message', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('กรุณากรอกอีเมลที่ถูกต้อง');
    }
  });

  it('requires password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('payoutFormSchema', () => {
  it('requires bank details', () => {
    const result = payoutFormSchema.safeParse({
      bankCode: '',
      bankAccountName: '',
      bankAccountNumber: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts complete payout info', () => {
    const result = payoutFormSchema.safeParse({
      bankCode: '014',
      bankAccountName: 'SOPet Co.',
      bankAccountNumber: '1234567890',
    });
    expect(result.success).toBe(true);
  });
});

describe('registerVendorSchema', () => {
  it('enforces minimum password length', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'short',
      fullName: 'Vendor Name',
    });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('rejects mismatched confirmation', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password123',
      confirmPassword: 'different123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });
});

describe('productFormSchema', () => {
  it('rejects negative base price', () => {
    const result = productFormSchema.safeParse({
      name: 'Dog Treats',
      basePrice: -1,
    });
    expect(result.success).toBe(false);
  });
});
