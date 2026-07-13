import { describe, expect, it } from 'vitest';
import { buildCreateStoreAsAdminInput, buildUpdateStoreAsAdminInput } from './admin-stores';
import type { AdminStoreFormValues } from '@/lib/validations';

const baseValues: AdminStoreFormValues = {
  name: 'Pet Shop',
  slug: 'pet-shop',
  description: '',
  status: 'approved',
  contactPhone: '',
  contactEmail: '',
  address: '',
  ownerId: '11111111-1111-4111-8111-111111111111',
  ownerEmail: 'owner@example.com',
};

describe('buildCreateStoreAsAdminInput', () => {
  it('maps ownerId to ownerUserId for the GraphQL mutation', () => {
    const input = buildCreateStoreAsAdminInput(baseValues);

    expect(input.ownerUserId).toBe('11111111-1111-4111-8111-111111111111');
    expect(input.name).toBe('Pet Shop');
    expect(input).not.toHaveProperty('ownerId');
  });
});

describe('buildUpdateStoreAsAdminInput', () => {
  it('sends ownerId uuid when a vendor is selected', () => {
    const input = buildUpdateStoreAsAdminInput(baseValues);

    expect(input.ownerId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('sends null ownerId when owner is cleared', () => {
    const input = buildUpdateStoreAsAdminInput({
      ...baseValues,
      ownerId: '',
    });

    expect(input.ownerId).toBeNull();
  });
});
