import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  loginImagesFormSchema,
  adminStoreFormSchema,
  payoutFormSchema,
  productFormSchema,
  registerVendorSchema,
  resetPasswordSchema,
  storeInfoFormSchema,
  storeRequestSchema,
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
      confirmPassword: 'short',
      fullName: 'Vendor Name',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirmation with Thai message', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'password123',
      confirmPassword: 'different123',
      fullName: 'Vendor Name',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(confirmIssue?.message).toBe('รหัสผ่านไม่ตรงกัน');
    }
  });

  it('requires confirmPassword', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'password123',
      confirmPassword: '',
      fullName: 'Vendor Name',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('accepts valid registration data', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'Vendor Name',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a whitespace-only fullName', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: '   ',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('fullName'))).toBe(true);
    }
  });

  it('trims surrounding whitespace from a valid fullName', () => {
    const result = registerVendorSchema.safeParse({
      email: 'vendor@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: '  Vendor Name  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Vendor Name');
    }
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

describe('adminStoreFormSchema', () => {
  it('requires ownerId with Thai message', () => {
    const result = adminStoreFormSchema.safeParse({
      name: 'Pet Shop',
      ownerId: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('ownerId'))).toBe(true);
      expect(result.error.issues.find((issue) => issue.path.includes('ownerId'))?.message).toBe(
        'กรุณาเลือกเจ้าของร้านค้า',
      );
    }
  });

  it('accepts create payload when owner is selected', () => {
    const result = adminStoreFormSchema.safeParse({
      name: 'Pet Shop',
      ownerId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an email typed into contactPhone instead of a phone number', () => {
    const result = adminStoreFormSchema.safeParse({
      name: 'Pet Shop',
      ownerId: '11111111-1111-4111-8111-111111111111',
      contactPhone: 'user@example.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path.includes('contactPhone'))?.message,
      ).toBe('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
    }
  });

  it('accepts a valid Thai mobile contactPhone, with or without dashes', () => {
    for (const contactPhone of ['0812345678', '081-234-5678']) {
      const result = adminStoreFormSchema.safeParse({
        name: 'Pet Shop',
        ownerId: '11111111-1111-4111-8111-111111111111',
        contactPhone,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects a whitespace-only store name instead of creating a blank-named store', () => {
    const result = adminStoreFormSchema.safeParse({
      name: '   ',
      ownerId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.success).toBe(false);
  });

  it('trims surrounding whitespace from a valid store name', () => {
    const result = adminStoreFormSchema.safeParse({
      name: '  Pet Shop  ',
      ownerId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Pet Shop');
    }
  });

  it('no longer has a redundant ownerEmail field (owner is chosen via the ownerId combobox)', () => {
    expect('ownerEmail' in adminStoreFormSchema.shape).toBe(false);
  });
});

describe('contactPhone validation (shared across storeInfoFormSchema, storeRequestSchema, adminStoreFormSchema)', () => {
  it('rejects a non-phone contactPhone on storeInfoFormSchema', () => {
    const result = storeInfoFormSchema.safeParse({
      name: 'My Store',
      contactPhone: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-phone contactPhone on storeRequestSchema', () => {
    const result = storeRequestSchema.safeParse({
      storeName: 'My Store',
      contactPhone: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('allows an empty/omitted contactPhone (optional field)', () => {
    expect(storeInfoFormSchema.safeParse({ name: 'My Store' }).success).toBe(true);
    expect(storeInfoFormSchema.safeParse({ name: 'My Store', contactPhone: '' }).success).toBe(
      true,
    );
  });
});

describe('loginImagesFormSchema', () => {
  it('rejects empty desktop with exact TBD-03 message', () => {
    const result = loginImagesFormSchema.safeParse({
      desktopImageUrl: '',
      mobileImageUrl: '',
      altText: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('ต้องมีรูปเดสก์ท็อป');
    }
  });

  it('accepts desktop-only with empty mobile and alt', () => {
    const result = loginImagesFormSchema.safeParse({
      desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
      mobileImageUrl: '',
      altText: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects alt longer than 255', () => {
    const result = loginImagesFormSchema.safeParse({
      desktopImageUrl: 'https://cdn.example.com/login-images/desktop.webp',
      mobileImageUrl: '',
      altText: 'a'.repeat(256),
    });
    expect(result.success).toBe(false);
  });
});
