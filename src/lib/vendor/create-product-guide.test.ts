import { beforeEach, describe, expect, it } from 'vitest';
import {
  CREATE_PRODUCT_GUIDE_STORAGE_KEY,
  clearCreateProductGuide,
  createProductGuideHref,
  getCreateProductGuideTip,
  isCreateProductGuideActive,
  startCreateProductGuide,
} from './create-product-guide';

describe('create-product-guide', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('starts and clears session guide flag', () => {
    expect(isCreateProductGuideActive()).toBe(false);
    startCreateProductGuide();
    expect(isCreateProductGuideActive()).toBe(true);
    expect(window.sessionStorage.getItem(CREATE_PRODUCT_GUIDE_STORAGE_KEY)).toContain('true');
    clearCreateProductGuide();
    expect(isCreateProductGuideActive()).toBe(false);
  });

  it('builds create href and tips for all wizard steps', () => {
    expect(createProductGuideHref()).toBe('/vendor/products/new?guide=create-product');
    expect(getCreateProductGuideTip(1)?.targetId).toBe('create-product-name');
    expect(getCreateProductGuideTip(4)?.primaryLabel).toBe('เสร็จสิ้น');
  });
});
