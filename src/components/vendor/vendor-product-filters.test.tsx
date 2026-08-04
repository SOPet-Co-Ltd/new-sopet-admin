import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorProductFilters } from './vendor-product-filters';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const baseProps = {
  categoryId: 'all',
  petTypeId: 'all',
  brandId: 'all',
  tagId: 'all',
  categories: [{ id: 'cat-1', name: 'อาหาร' }],
  petTypes: [{ id: 'pet-1', name: 'สุนัข' }],
  brands: [{ id: 'brand-1', name: 'SoPet Foods' }],
  tags: [{ id: 'tag-1', name: 'ออร์แกนิก' }],
  onCategoryChange: vi.fn(),
  onPetTypeChange: vi.fn(),
  onBrandChange: vi.fn(),
  onTagChange: vi.fn(),
};

describe('VendorProductFilters', () => {
  it('keeps filter fields collapsed until the toggle is opened', async () => {
    const user = userEvent.setup();
    render(<VendorProductFilters {...baseProps} leading={<input aria-label="ค้นหาสินค้า" />} />);

    expect(screen.getByLabelText('ค้นหาสินค้า')).toBeInTheDocument();
    expect(screen.queryByLabelText('หมวดหมู่')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรอง' }));

    expect(screen.getByLabelText('หมวดหมู่')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'ตัวเลือกตัวกรอง' })).toBeInTheDocument();
  });

  it('shows removable chips for active filters and clears them', async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onBrandChange = vi.fn();

    const { rerender } = render(
      <VendorProductFilters
        {...baseProps}
        categoryId="cat-1"
        brandId="brand-1"
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'ตัวกรอง 2 รายการ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ลบตัวกรอง แบรนด์: SoPet Foods' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' }));
    expect(onCategoryChange).toHaveBeenCalledWith('all');

    await user.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onCategoryChange).toHaveBeenCalledWith('all');
    expect(onBrandChange).toHaveBeenCalledWith('all');

    rerender(
      <VendorProductFilters
        {...baseProps}
        categoryId="all"
        brandId="all"
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
      />,
    );

    expect(screen.queryByLabelText('ตัวกรองที่เลือก')).not.toBeInTheDocument();
  });
});
