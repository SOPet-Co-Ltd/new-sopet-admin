import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorProductFilters } from './vendor-product-filters';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const baseProps = {
  status: 'all' as const,
  categoryId: 'all',
  petTypeId: 'all',
  brandId: 'all',
  tagId: 'all',
  minPrice: undefined,
  maxPrice: undefined,
  categories: [{ id: 'cat-1', name: 'อาหาร' }],
  petTypes: [{ id: 'pet-1', name: 'สุนัข' }],
  brands: [{ id: 'brand-1', name: 'SoPet Foods' }],
  tags: [{ id: 'tag-1', name: 'ออร์แกนิก' }],
  onStatusChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onPetTypeChange: vi.fn(),
  onBrandChange: vi.fn(),
  onTagChange: vi.fn(),
  onPriceRangeChange: vi.fn(),
};

describe('VendorProductFilters', () => {
  it('keeps advanced filters collapsed until the toggle is opened', async () => {
    const user = userEvent.setup();
    render(<VendorProductFilters {...baseProps} leading={<input aria-label="ค้นหาสินค้า" />} />);

    expect(screen.getByLabelText('ค้นหาสินค้า')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'สถานะสินค้า' })).toBeInTheDocument();
    expect(screen.queryByLabelText('หมวดหมู่')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ต่ำสุด')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));

    expect(screen.getByLabelText('หมวดหมู่')).toBeInTheDocument();
    expect(screen.getByLabelText('ต่ำสุด')).toBeInTheDocument();
    expect(screen.getByLabelText('สูงสุด')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'ตัวเลือกตัวกรอง' })).toBeInTheDocument();
  });

  it('exposes always-visible status pills', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(<VendorProductFilters {...baseProps} onStatusChange={onStatusChange} />);

    await user.click(screen.getByRole('button', { name: 'เผยแพร่' }));
    expect(onStatusChange).toHaveBeenCalledWith('published');
  });

  it('shows removable chips for active filters and clears them', async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const onBrandChange = vi.fn();
    const onStatusChange = vi.fn();
    const onPriceRangeChange = vi.fn();

    const { rerender } = render(
      <VendorProductFilters
        {...baseProps}
        status="published"
        categoryId="cat-1"
        brandId="brand-1"
        minPrice={100}
        maxPrice={500}
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
        onStatusChange={onStatusChange}
        onPriceRangeChange={onPriceRangeChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม 3 รายการ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง สถานะ: เผยแพร่' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ลบตัวกรอง แบรนด์: SoPet Foods' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง ราคา: 100–500 บาท' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' }));
    expect(onCategoryChange).toHaveBeenCalledWith('all');

    await user.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onStatusChange).toHaveBeenCalledWith('all');
    expect(onCategoryChange).toHaveBeenCalledWith('all');
    expect(onBrandChange).toHaveBeenCalledWith('all');
    expect(onPriceRangeChange).toHaveBeenCalledWith({
      minPrice: undefined,
      maxPrice: undefined,
    });

    rerender(
      <VendorProductFilters
        {...baseProps}
        status="all"
        categoryId="all"
        brandId="all"
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
        onStatusChange={onStatusChange}
        onPriceRangeChange={onPriceRangeChange}
      />,
    );

    expect(screen.queryByLabelText('ตัวกรองที่เลือก')).not.toBeInTheDocument();
  });

  it('commits price range on blur and swaps inverted bounds', async () => {
    const user = userEvent.setup();
    const onPriceRangeChange = vi.fn();
    render(<VendorProductFilters {...baseProps} onPriceRangeChange={onPriceRangeChange} />);

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));
    await user.type(screen.getByLabelText('ต่ำสุด'), '500');
    await user.type(screen.getByLabelText('สูงสุด'), '100');
    await user.tab();

    expect(onPriceRangeChange).toHaveBeenCalledWith({ minPrice: 100, maxPrice: 500 });
  });
});
