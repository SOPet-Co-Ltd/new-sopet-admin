import { describe, expect, it } from 'vitest';
import {
  mapOrder,
  mapPagination,
  mapProduct,
  mapStore,
  mapStoreRequest,
  mapUser,
  mapVendorInvitation,
} from './mappers';

describe('mapUser', () => {
  it('maps GraphQL user fields and optional storeId', () => {
    expect(
      mapUser(
        {
          id: 'u1',
          email: 'vendor@example.com',
          fullName: 'Vendor User',
          role: 'vendor',
        },
        'store-123',
      ),
    ).toEqual({
      id: 'u1',
      email: 'vendor@example.com',
      fullName: 'Vendor User',
      role: 'vendor',
      storeId: 'store-123',
      profilePhotoUrl: null,
      emailVerified: false,
    });
  });

  it('maps emailVerified when provided', () => {
    expect(
      mapUser({
        id: 'u3',
        email: 'verified@example.com',
        fullName: 'Verified Vendor',
        role: 'vendor',
        emailVerified: true,
      }),
    ).toEqual({
      id: 'u3',
      email: 'verified@example.com',
      fullName: 'Verified Vendor',
      role: 'vendor',
      storeId: undefined,
      profilePhotoUrl: null,
      emailVerified: true,
    });
  });

  it('maps profilePhotoUrl when provided', () => {
    expect(
      mapUser({
        id: 'u2',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin',
        profilePhotoUrl: 'https://cdn.example.com/avatar.jpg',
      }),
    ).toEqual({
      id: 'u2',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'admin',
      storeId: undefined,
      profilePhotoUrl: 'https://cdn.example.com/avatar.jpg',
      emailVerified: false,
    });
  });
});

describe('mapStore', () => {
  it('converts null optional fields to undefined', () => {
    expect(
      mapStore({
        id: 's1',
        name: 'Pet Shop',
        slug: 'pet-shop',
        description: null,
        logoUrl: null,
        bannerUrl: null,
        status: 'approved',
      }),
    ).toEqual({
      id: 's1',
      name: 'Pet Shop',
      slug: 'pet-shop',
      description: undefined,
      logoUrl: undefined,
      bannerUrl: undefined,
      status: 'approved',
    });
  });
});

describe('mapOrder', () => {
  it('maps nested order items', () => {
    const order = mapOrder({
      id: 'o1',
      orderNumber: 'ORD-001',
      status: 'pending',
      createdAt: '2026-01-01T00:00:00.000Z',
      subtotal: 100,
      shippingFee: 50,
      discountAmount: 10,
      total: 140,
      paymentMethod: 'promptpay',
      guestPhone: null,
      guestName: 'Guest',
      guestEmail: null,
      storeShippings: [],
      items: [
        {
          id: 'i1',
          storeId: 's1',
          productName: 'Dog Food',
          unitPrice: 100,
          quantity: 1,
          subtotal: 100,
          fulfillmentStatus: 'pending',
        },
      ],
    });

    expect(order.guestPhone).toBeUndefined();
    expect(order.items).toHaveLength(1);
    expect(order.items[0].productName).toBe('Dog Food');
    expect(order.items[0].variantOptions).toBeNull();
  });

  it('parses non-empty variantOptions JSON and omits empty/invalid snapshots', () => {
    const order = mapOrder({
      id: 'o1',
      orderNumber: 'ORD-001',
      status: 'pending',
      createdAt: '2026-01-01T00:00:00.000Z',
      subtotal: 100,
      shippingFee: 50,
      discountAmount: 10,
      total: 140,
      paymentMethod: 'promptpay',
      storeShippings: [],
      items: [
        {
          id: 'i1',
          storeId: 's1',
          productName: 'Dog Food',
          unitPrice: 100,
          quantity: 1,
          subtotal: 100,
          fulfillmentStatus: 'pending',
          variantOptions: JSON.stringify({ รสชาติ: 'ปลา', ขนาด: '1kg' }),
        },
        {
          id: 'i2',
          storeId: 's1',
          productName: 'Cat Food',
          unitPrice: 50,
          quantity: 1,
          subtotal: 50,
          fulfillmentStatus: 'pending',
          variantOptions: '{}',
        },
        {
          id: 'i3',
          storeId: 's1',
          productName: 'Treat',
          unitPrice: 20,
          quantity: 1,
          subtotal: 20,
          fulfillmentStatus: 'pending',
          variantOptions: 'not-json',
        },
      ],
    });

    expect(order.items[0].variantOptions).toEqual({ รสชาติ: 'ปลา', ขนาด: '1kg' });
    expect(order.items[1].variantOptions).toBeNull();
    expect(order.items[2].variantOptions).toBeNull();
  });
});

describe('mapProduct', () => {
  it('defaults tags to an empty array when missing', () => {
    const product = mapProduct({
      id: 'p1',
      storeId: 's1',
      name: 'Cat Toy',
      slug: 'cat-toy',
      basePrice: 99,
      status: 'draft',
      tags: [],
    });

    expect(product.tags).toEqual([]);
    expect(product.description).toBeUndefined();
  });
});

describe('mapPagination', () => {
  it('passes through pagination metadata', () => {
    expect(mapPagination({ page: 2, limit: 20, total: 45, totalPages: 3 })).toEqual({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });
});

describe('mapStoreRequest', () => {
  it('maps storeName to name', () => {
    expect(
      mapStoreRequest({
        id: 'r1',
        storeName: 'New Store',
        status: 'pending',
      }),
    ).toMatchObject({ id: 'r1', name: 'New Store', status: 'pending' });
  });
});

describe('mapVendorInvitation', () => {
  it('preserves invitation token when present', () => {
    expect(
      mapVendorInvitation({
        id: 'inv1',
        email: 'new@example.com',
        status: 'pending',
        expiresAt: '2026-12-31T00:00:00.000Z',
        token: 'secret-token',
      }),
    ).toEqual({
      id: 'inv1',
      email: 'new@example.com',
      status: 'pending',
      expiresAt: '2026-12-31T00:00:00.000Z',
      token: 'secret-token',
    });
  });
});
