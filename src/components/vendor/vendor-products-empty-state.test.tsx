import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorProductsEmptyState } from './vendor-products-empty-state';

describe('VendorProductsEmptyState', () => {
  it('offers add-product CTA for an empty catalog', () => {
    render(<VendorProductsEmptyState mode="catalog" />);

    expect(screen.getByRole('heading', { name: 'ยังไม่มีสินค้าในร้าน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'เพิ่มสินค้า' })).toHaveAttribute(
      'href',
      '/vendor/products/new',
    );
  });

  it('offers clear-filters for a filtered empty result', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(<VendorProductsEmptyState mode="filtered" onClearFilters={onClearFilters} />);

    expect(screen.getByRole('heading', { name: 'ไม่พบสินค้าที่ตรงเงื่อนไข' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });
});
