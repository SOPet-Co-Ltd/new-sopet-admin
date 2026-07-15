import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types';
import VendorProductDetailPage from './page';

const mockProduct: Product = {
  id: 'prod-1',
  storeId: 'store-1',
  name: 'อาหารสุนัขออร์แกนิก',
  slug: 'organic-dog-food',
  description: 'อาหารคุณภาพสูงสำหรับสุนัข',
  basePrice: 590,
  compareAtPrice: 690,
  warning: 'เก็บในที่แห้ง',
  expiryDate: '2027-01-15',
  status: 'published',
  category: 'อาหารสุนัข',
  categoryId: 'cat-1',
  petTypeId: 'pet-1',
  brandId: 'brand-1',
  tags: ['ออร์แกนิก', 'พรีเมียม'],
  tagIds: ['tag-1', 'tag-2'],
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  images: [
    {
      id: 'img-1',
      imageUrl: 'https://cdn.example.com/dog-food.jpg',
      sortOrder: 0,
      isThumbnail: true,
    },
  ],
  variants: [
    {
      id: 'var-1',
      sku: 'DOG-ORG-5KG',
      price: 590,
      stockQuantity: 12,
      optionsJson: JSON.stringify({ ขนาด: '5 กก.' }),
    },
    {
      id: 'var-2',
      sku: 'DOG-ORG-1KG',
      price: 190,
      stockQuantity: 3,
      optionsJson: JSON.stringify({ ขนาด: '1 กก.' }),
    },
  ],
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'prod-1' }),
}));

vi.mock('@/hooks/useProduct', () => ({
  useProduct: () => ({
    data: mockProduct,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useTaxonomy', () => ({
  useApprovedPetTypes: () => ({
    data: [{ id: 'pet-1', name: 'สุนัข', slug: 'dog', status: 'approved' }],
  }),
  useApprovedBrands: () => ({
    data: [{ id: 'brand-1', name: 'SoPet Foods', slug: 'sopet-foods', status: 'approved' }],
  }),
}));

vi.mock('@/hooks/useReviews', () => ({
  useStoreProductReviews: () => ({
    data: {
      items: [
        {
          id: 'rev-1',
          productId: 'prod-1',
          rating: 5,
          comment: 'สุนัขชอบมาก',
          status: 'approved',
          createdAt: '2026-06-01T10:00:00.000Z',
          customerName: 'คุณเอ',
          reply: { id: 'reply-1', body: 'ขอบคุณครับ', createdAt: '', updatedAt: '' },
        },
        {
          id: 'rev-2',
          productId: 'other-prod',
          rating: 2,
          comment: 'ไม่เกี่ยว',
          status: 'approved',
          createdAt: '2026-06-02T10:00:00.000Z',
          customerName: 'คุณบี',
        },
      ],
      pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

describe('VendorProductDetailPage', () => {
  it('renders read-only product details with stats, reviews, edit and variants links', () => {
    render(<VendorProductDetailPage />);

    expect(screen.getByRole('heading', { name: 'อาหารสุนัขออร์แกนิก' })).toBeInTheDocument();
    expect(screen.getByText('รายละเอียดสินค้า (อ่านอย่างเดียว)')).toBeInTheDocument();
    expect(screen.getByText('เผยแพร่')).toBeInTheDocument();
    expect(screen.getByText('อาหารสุนัข')).toBeInTheDocument();
    expect(screen.getByText('สุนัข')).toBeInTheDocument();
    expect(screen.getByText('SoPet Foods')).toBeInTheDocument();
    expect(screen.getByText('ออร์แกนิก')).toBeInTheDocument();
    expect(screen.getByText('พรีเมียม')).toBeInTheDocument();
    expect(screen.getByText('อาหารคุณภาพสูงสำหรับสุนัข')).toBeInTheDocument();
    expect(screen.getByText('เก็บในที่แห้ง')).toBeInTheDocument();
    expect(screen.getByText('DOG-ORG-5KG')).toBeInTheDocument();
    expect(screen.getByText('ขนาด: 5 กก.')).toBeInTheDocument();

    expect(screen.getByText('คะแนนเฉลี่ย')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('ยอดขาย')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('สต็อกรวม')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('ใกล้หมด')).toBeInTheDocument();

    expect(screen.getByText('สุนัขชอบมาก')).toBeInTheDocument();
    expect(screen.getByText('คุณเอ')).toBeInTheDocument();
    expect(screen.getByText('ขอบคุณครับ')).toBeInTheDocument();
    expect(screen.queryByText('ไม่เกี่ยว')).not.toBeInTheDocument();

    expect(screen.getByText('ช่วงราคาตัวเลือก')).toBeInTheDocument();
    expect(screen.queryByText('ราคาฐาน')).not.toBeInTheDocument();
    expect(screen.queryByText('ราคาขีดฆ่า')).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'แก้ไขข้อมูล' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/edit',
    );
    expect(screen.getByRole('link', { name: 'แก้ไขสต็อก' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/stock',
    );
    expect(screen.getByRole('link', { name: 'แก้ไขตัวเลือก' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/variants',
    );
    expect(screen.queryByRole('link', { name: 'แก้ไข' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'จัดการตัวเลือก' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ดูรีวิวทั้งหมด' })).toHaveAttribute(
      'href',
      '/vendor/reviews',
    );
  });
});
