import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VendorCustomerDetailPage from './page';

const mockCustomer = {
  id: 'cust-1',
  phone: '0812345678',
  fullName: 'Mai',
  email: 'mai@example.com',
  isVerified: true,
  lastLoginAt: '2026-01-10T08:00:00.000Z',
  createdAt: '2025-12-01T10:00:00.000Z',
  insights: {
    totalSpent: 2500,
    orderCount: 2,
    averageOrderValue: 1250,
    lastOrderAt: '2026-01-08T12:00:00.000Z',
    favoriteCount: 2,
    reviewCount: 1,
    recentOrders: [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'paid',
        total: 1500,
        createdAt: '2026-01-08T12:00:00.000Z',
        items: [
          {
            productName: 'อาหารสุนัขพรีเมียม',
            quantity: 1,
            unitPrice: 1500,
            subtotal: 1500,
          },
        ],
      },
    ],
    recentReviews: [
      {
        id: 'review-1',
        productName: 'อาหารสุนัขพรีเมียม',
        rating: 5,
        comment: 'ดีมาก',
        createdAt: '2026-01-09T10:00:00.000Z',
      },
    ],
    favoriteProducts: [
      {
        productName: 'ขนมแมว',
        createdAt: '2026-01-05T10:00:00.000Z',
      },
    ],
  },
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'cust-1' }),
}));

vi.mock('@/hooks/useVendorCustomers', () => ({
  useVendorCustomerDetail: () => ({
    data: mockCustomer,
    isLoading: false,
    error: null,
  }),
}));

describe('VendorCustomerDetailPage', () => {
  it('renders store-scoped customer insights and read-only profile', () => {
    render(<VendorCustomerDetailPage />);

    expect(screen.getByRole('heading', { name: 'Mai' })).toBeInTheDocument();
    expect(screen.getByText('รายละเอียดลูกค้า (อ่านอย่างเดียว)')).toBeInTheDocument();
    expect(screen.getByText('ยืนยันแล้ว')).toBeInTheDocument();
    expect(screen.getByText('ยอดใช้จ่ายที่ร้าน')).toBeInTheDocument();
    expect(screen.getByText('จำนวนคำสั่งซื้อที่ร้าน')).toBeInTheDocument();
    expect(screen.getByText('กิจกรรมกับร้าน')).toBeInTheDocument();
    expect(screen.getByText('ประวัติการสั่งซื้อที่ร้าน')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('รีวิวล่าสุดที่ร้าน')).toBeInTheDocument();
    expect(screen.getByText('ดีมาก')).toBeInTheDocument();
    expect(screen.getByText('สินค้าที่ชอบล่าสุด')).toBeInTheDocument();
    expect(screen.getByText('ขนมแมว')).toBeInTheDocument();
    expect(screen.getByText('0812345678')).toBeInTheDocument();
  });
});
