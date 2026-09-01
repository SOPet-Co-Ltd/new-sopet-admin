import { describe, expect, it } from 'vitest';
import { getStoreSwitchRedirectPath } from './store-switch-redirect';

describe('getStoreSwitchRedirectPath', () => {
  it('redirects product detail and sub-pages to the products list', () => {
    expect(getStoreSwitchRedirectPath('/vendor/products/prod-1')).toBe('/vendor/products');
    expect(getStoreSwitchRedirectPath('/vendor/products/prod-1/edit')).toBe('/vendor/products');
    expect(getStoreSwitchRedirectPath('/vendor/products/prod-1/stock')).toBe('/vendor/products');
    expect(getStoreSwitchRedirectPath('/vendor/products/prod-1/variants')).toBe('/vendor/products');
    expect(getStoreSwitchRedirectPath('/vendor/products/new')).toBe('/vendor/products');
  });

  it('redirects promotion edit to the create promotion page', () => {
    expect(getStoreSwitchRedirectPath('/vendor/promotions/promo-1/edit')).toBe(
      '/vendor/promotions/new',
    );
  });

  it('keeps list and non-product vendor pages', () => {
    expect(getStoreSwitchRedirectPath('/vendor/products')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/promotions')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/promotions/new')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/promotions/new/coupon')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/orders')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/orders/ord-1')).toBeNull();
    expect(getStoreSwitchRedirectPath('/vendor/stores')).toBeNull();
  });
});
