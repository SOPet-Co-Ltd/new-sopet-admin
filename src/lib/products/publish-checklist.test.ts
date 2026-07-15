import { describe, expect, it } from 'vitest';
import type { Product } from '@/types';
import { buildLivePublishChecklist } from './publish-checklist';

const product: Product = {
  id: 'prod-1',
  storeId: 'store-1',
  name: 'Server name',
  slug: 'server-name',
  basePrice: 100,
  status: 'draft',
  categoryId: 'cat-1',
  petTypeId: 'pet-1',
  tags: [],
  images: [{ id: 'img-1', imageUrl: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
  variants: [{ id: 'v1', sku: 'SKU1', price: 100, stockQuantity: 5 }],
};

describe('buildLivePublishChecklist', () => {
  it('uses form overlays for name, category, and pet type', () => {
    const checklist = buildLivePublishChecklist(product, {
      name: '',
      categoryId: '',
      petTypeId: 'pet-1',
    });

    expect(checklist.items.find((i) => i.key === 'name')?.complete).toBe(false);
    expect(checklist.items.find((i) => i.key === 'category')?.complete).toBe(false);
    expect(checklist.items.find((i) => i.key === 'petType')?.complete).toBe(true);
    expect(checklist.canPublish).toBe(false);
  });

  it('marks all items complete when product and form are ready', () => {
    const checklist = buildLivePublishChecklist(product, {
      name: 'Ready product',
      categoryId: 'cat-1',
      petTypeId: 'pet-1',
    });

    expect(checklist.canPublish).toBe(true);
    expect(checklist.missingKeys).toEqual([]);
  });
});
