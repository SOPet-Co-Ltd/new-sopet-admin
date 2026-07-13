import { describe, expect, it } from 'vitest';
import {
  isVendorRouteAllowedWithoutStores,
  vendorHasStores,
  VENDOR_STORELESS_ROUTE_PREFIXES,
} from '@/lib/vendor/vendor-store-access';

describe('vendorHasStores', () => {
  it('returns false for empty or undefined store lists', () => {
    expect(vendorHasStores([])).toBe(false);
    expect(vendorHasStores(undefined)).toBe(false);
  });

  it('returns true when at least one store exists', () => {
    expect(vendorHasStores([{ store: { id: '1' } }])).toBe(true);
  });
});

describe('isVendorRouteAllowedWithoutStores', () => {
  it.each(VENDOR_STORELESS_ROUTE_PREFIXES)('allows exact path %s', (path) => {
    expect(isVendorRouteAllowedWithoutStores(path)).toBe(true);
  });

  it('allows nested paths under storeless prefixes', () => {
    expect(isVendorRouteAllowedWithoutStores('/vendor/stores')).toBe(true);
    expect(isVendorRouteAllowedWithoutStores('/vendor/invitations/accept')).toBe(true);
    expect(isVendorRouteAllowedWithoutStores('/vendor/requests')).toBe(true);
  });

  it('blocks dashboard and operational vendor routes', () => {
    expect(isVendorRouteAllowedWithoutStores('/vendor')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/orders')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/products')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/products/new')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/customers')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/reviews')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/promotions')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/team')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/api')).toBe(false);
    expect(isVendorRouteAllowedWithoutStores('/vendor/reactivation')).toBe(false);
  });
});
