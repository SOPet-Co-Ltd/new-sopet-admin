/**
 * Phase 0 shape assertions for promotion-universal-conditions Playwright fixtures.
 * Run: yarn vitest run --config e2e/fixtures/promotion-universal-conditions/vitest.shape.config.ts
 */
import { describe, expect, it } from 'vitest';
import {
  NEW_CUSTOMER_SEED_N_DAYS,
  expectedCreatePromotionConditions,
  expectedLoggedInOnlyAndNewCustomerConditions,
  expectedLoggedInOnlyConditions,
  platformPublishedProduct,
  vendorStoreScopedProduct,
} from './data';
import {
  platformProductsMockRequiresStoreId,
  resolvePromotionUcOperation,
  vendorProductsMockIsStoreScoped,
  type CreatePromotionCapture,
} from './graphql-mock';

describe('promotion-universal-conditions admin fixture stubs', () => {
  it('expected admin create conditions include newCustomer only (no BxGy)', () => {
    expect(expectedCreatePromotionConditions.newCustomer).toEqual({
      enabled: true,
      nDays: NEW_CUSTOMER_SEED_N_DAYS,
    });
    expect(expectedCreatePromotionConditions.loggedInOnly).toBeUndefined();
    expect(expectedCreatePromotionConditions.productId).toBeUndefined();
    expect(expectedCreatePromotionConditions.buyQuantity).toBeUndefined();
    expect(expectedCreatePromotionConditions.getQuantity).toBeUndefined();
  });

  it('Rule L5 loggedInOnly golden is exactly { enabled: true }', () => {
    expect(expectedLoggedInOnlyConditions).toEqual({
      loggedInOnly: { enabled: true },
    });
    expect(expectedLoggedInOnlyAndNewCustomerConditions).toEqual({
      loggedInOnly: { enabled: true },
      newCustomer: { enabled: true, nDays: NEW_CUSTOMER_SEED_N_DAYS },
    });
  });

  it('platform Products mock does not require storeId', () => {
    expect(platformProductsMockRequiresStoreId()).toBe(false);

    const withoutStoreId = resolvePromotionUcOperation('Products', {
      operationName: 'Products',
      variables: { search: 'dog' },
    });
    expect(withoutStoreId?.products).toMatchObject({
      items: [{ id: platformPublishedProduct.id, status: 'published' }],
    });
  });

  it('vendor product mock is store-scoped', () => {
    expect(vendorProductsMockIsStoreScoped()).toBe(true);

    const vendorProducts = resolvePromotionUcOperation('VendorProducts', {
      operationName: 'VendorProducts',
      variables: {},
    });
    expect(vendorProducts?.vendorProducts).toMatchObject({
      items: [{ id: vendorStoreScopedProduct.id, storeId: vendorStoreScopedProduct.storeId }],
    });

    const mismatchedStore = resolvePromotionUcOperation(
      'Products',
      {
        operationName: 'Products',
        variables: { storeId: 'other-store' },
      },
      { vendorStoreScoped: true, vendorStoreId: vendorStoreScopedProduct.storeId },
    );
    expect(
      (mismatchedStore?.products as { items: unknown[] } | undefined)?.items ?? [],
    ).toHaveLength(0);
  });

  it('CreatePromotion capture parses conditions JSON', () => {
    const captures: CreatePromotionCapture[] = [];
    const conditions = JSON.stringify(expectedCreatePromotionConditions);

    resolvePromotionUcOperation(
      'CreatePromotion',
      {
        operationName: 'CreatePromotion',
        variables: {
          input: {
            code: 'FIXED100',
            name: 'ส่วนลดคงที่ 100 บาท',
            type: 'fixed_amount',
            conditions,
          },
        },
      },
      {
        onCreatePromotion: (capture) => {
          captures.push(capture);
        },
      },
    );

    expect(captures).toHaveLength(1);
    expect(captures[0]?.conditionsRaw).toBe(conditions);
    expect(captures[0]?.conditionsParsed).toEqual(expectedCreatePromotionConditions);
  });

  it('CreatePromotion capture exposes loggedInOnly conditions String for Rule L5 asserts', () => {
    const captures: CreatePromotionCapture[] = [];
    const conditions = JSON.stringify(expectedLoggedInOnlyConditions);

    resolvePromotionUcOperation(
      'CreatePromotion',
      {
        operationName: 'CreatePromotion',
        variables: {
          input: {
            code: 'MEMBER10',
            name: 'สมาชิกเท่านั้น 10%',
            type: 'percentage',
            conditions,
          },
        },
      },
      {
        onCreatePromotion: (capture) => {
          captures.push(capture);
        },
      },
    );

    expect(captures).toHaveLength(1);
    expect(captures[0]?.conditionsRaw).toBe(conditions);
    expect(captures[0]?.conditionsParsed).toEqual({
      loggedInOnly: { enabled: true },
    });
    expect(captures[0]?.conditionsParsed?.loggedInOnly).toEqual({ enabled: true });
  });
});
