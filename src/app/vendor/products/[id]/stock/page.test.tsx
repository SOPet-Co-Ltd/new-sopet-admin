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
        {
          id: 'v2',
          sku: 'SHAMPOO-LOW',
          price: 250,
          stockQuantity: 3,
          optionsJson: JSON.stringify({ size: 'travel' }),
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

  it('shows inventory truth: current qty, thresholds, and live summary', () => {
    render(<ProductStockPage />);

    expect(screen.getByRole('heading', { name: 'แก้ไขสต็อก' })).toBeInTheDocument();
    expect(screen.getByText('default: standard')).toBeInTheDocument();
    expect(screen.getByText('พร้อมขาย')).toBeInTheDocument();
    expect(screen.getAllByText('ใกล้หมด').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/คงเหลือปัจจุบัน/).length).toBe(2);
    expect(screen.getByRole('region', { name: 'สรุปสต็อก' })).toBeInTheDocument();
    expect(screen.getByText(/ใกล้หมดเมื่อเหลือไม่เกิน\s*5\s*ชิ้น/)).toBeInTheDocument();
  });

  it('updates summary and delta when stock changes, then saves', async () => {
    const user = userEvent.setup();
    render(<ProductStockPage />);

    const stockInputs = screen.getAllByLabelText('จำนวนใหม่');
    await user.clear(stockInputs[0]!);
    await user.type(stockInputs[0]!, '25');

    expect(screen.getByLabelText('เปลี่ยนแปลง +15')).toBeInTheDocument();
    expect(screen.getByText('1 รายการรอบันทึก · สต็อกรวม 28')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'บันทึกสต็อก' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      productId: 'prod-1',
      updates: [{ variantId: 'v1', stockQuantity: 25 }],
    });
    expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1');
  });

  it('disables save while the only edits are invalid', async () => {
    const user = userEvent.setup();
    render(<ProductStockPage />);

    const stockInputs = screen.getAllByLabelText('จำนวนใหม่');
    await user.clear(stockInputs[0]!);
    await user.type(stockInputs[0]!, '-1');

    expect(screen.getByRole('button', { name: 'บันทึกสต็อก' })).toBeDisabled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('surfaces validation when a changed row is valid but another is empty', async () => {
    const user = userEvent.setup();
    render(<ProductStockPage />);

    const stockInputs = screen.getAllByLabelText('จำนวนใหม่');
    await user.clear(stockInputs[0]!);
    await user.type(stockInputs[0]!, '25');
    await user.clear(stockInputs[1]!);

    await user.click(screen.getByRole('button', { name: 'บันทึกสต็อก' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'กรุณาระบุจำนวนสต็อกเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
    );
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
