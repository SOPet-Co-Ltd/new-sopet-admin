import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorProductsMobileList } from './vendor-products-mobile-list';
import type { Product } from '@/types';

const product: Product = {
  id: 'p1',
  storeId: 's1',
  name: 'Dog Food',
  slug: 'dog-food',
  basePrice: 199,
  status: 'published',
  tags: ['food'],
  category: 'อาหาร',
  thumbnailUrl: 'https://example.com/dog.jpg',
  variants: [{ id: 'v1', sku: 'DF-1', price: 199, stockQuantity: 12 }],
};

describe('VendorProductsMobileList', () => {
  it('renders thumbnail, price, and stock for catalog scanning', () => {
    render(
      <VendorProductsMobileList products={[product]} onProductClick={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByTestId('product-thumbnail-image')).toHaveAttribute(
      'src',
      'https://example.com/dog.jpg',
    );
    expect(screen.getByText('ราคา')).toBeInTheDocument();
    expect(screen.getByText('สต็อก')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('calls onProductClick when a row is activated', async () => {
    const user = userEvent.setup();
    const onProductClick = vi.fn();
    render(
      <VendorProductsMobileList
        products={[product]}
        onProductClick={onProductClick}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ดูรายละเอียด Dog Food' }));
    expect(onProductClick).toHaveBeenCalledWith(product);
  });

  it('renders custom empty state when provided', () => {
    render(
      <VendorProductsMobileList
        products={[]}
        emptyState={<div>empty-custom</div>}
        onProductClick={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('empty-custom')).toBeInTheDocument();
  });
});
