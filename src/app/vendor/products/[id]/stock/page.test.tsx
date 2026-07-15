import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductStockPage from './page';

const mockPush = vi.fn();
const mutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'prod-1' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useProduct', () => ({
  useProduct: () => ({
    data: {
      id: 'prod-1',
      name: 'Pet Shampoo 500ml',
      variants: [
        {
          id: 'v1',
          sku: 'SHAMPOO-500',
          price: 250,
          stockQuantity: 10,
          optionsJson: JSON.stringify({ default: 'standard' }),
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useProductMutations', () => ({
  useUpdateProductVariantStocks: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe('ProductStockPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it('saves changed stock and returns to product detail', async () => {
    const user = userEvent.setup();
    render(<ProductStockPage />);

    expect(screen.getByRole('heading', { name: 'แก้ไขสต็อก' })).toBeInTheDocument();
    expect(screen.getByText('default: standard')).toBeInTheDocument();

    const stockInput = screen.getByLabelText('จำนวนสต็อก');
    await user.clear(stockInput);
    await user.type(stockInput, '25');
    await user.click(screen.getByRole('button', { name: 'บันทึกสต็อก' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      productId: 'prod-1',
      updates: [{ variantId: 'v1', stockQuantity: 25 }],
    });
    expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1');
  });
});
