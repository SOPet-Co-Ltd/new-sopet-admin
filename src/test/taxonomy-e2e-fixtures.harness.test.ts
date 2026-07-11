import { describe, expect, it } from 'vitest';
import {
  categoryDeleteImpact,
  deleteCategoryResult,
  rejectedCategories,
  rejectedTags,
} from '../../e2e/fixtures/taxonomy/data';
import { resolveTaxonomyOperation } from '../../e2e/fixtures/taxonomy/graphql-mock';

const WIZARD_AND_REJECTED_OPERATIONS = [
  'CategoryDeleteImpact',
  'RejectedCategories',
  'RejectedTags',
  'DeleteCategory',
] as const;

describe('taxonomy e2e fixtures harness', () => {
  it('search-taxonomy-delete skeleton file is present', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync('e2e/search-taxonomy-delete.fixture.e2e.skeleton.ts')).toBe(true);
  });

  it('search-taxonomy-delete spec file is present', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync('e2e/search-taxonomy-delete.fixture.e2e.spec.ts')).toBe(true);
  });

  it('resolves delete wizard and rejected taxonomy GraphQL operations', () => {
    for (const operation of WIZARD_AND_REJECTED_OPERATIONS) {
      expect(resolveTaxonomyOperation(operation)).not.toBeNull();
    }

    expect(resolveTaxonomyOperation('CategoryDeleteImpact')).toEqual({ categoryDeleteImpact });
    expect(resolveTaxonomyOperation('RejectedCategories')).toEqual({ rejectedCategories });
    expect(resolveTaxonomyOperation('RejectedTags')).toEqual({ rejectedTags });
    expect(resolveTaxonomyOperation('DeleteCategory')).toEqual({
      deleteCategory: deleteCategoryResult,
    });
  });

  it('matches wizard impact and delete mutation fixture shapes', () => {
    expect(categoryDeleteImpact).toMatchObject({
      productCount: expect.any(Number),
      products: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          slug: expect.any(String),
        }),
      ]),
    });

    expect(deleteCategoryResult).toMatchObject({
      success: true,
      deletedId: expect.any(String),
      detachedProductCount: expect.any(Number),
      notifiedStoreCount: expect.any(Number),
    });

    expect(rejectedCategories[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
      approvalStatus: 'rejected',
    });

    expect(rejectedTags[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      slug: expect.any(String),
      approvalStatus: 'rejected',
    });
  });
});
