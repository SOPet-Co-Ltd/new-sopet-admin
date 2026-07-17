import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminCustomerEditPage from './page';

const mutateAsync = vi.fn();
const setActiveMutate = vi.fn();

const mockCustomer = {
  id: 'cust-1',
  phone: '0812345678',
  fullName: 'สมชาย ใจดี',
  email: 'somchai@example.com',
  dateOfBirth: '1990-05-15',
  isVerified: true,
  isActive: true,
  lastLoginAt: '2026-01-10T08:00:00.000Z',
  createdAt: '2025-12-01T10:00:00.000Z',
  updatedAt: '2026-01-10T08:00:00.000Z',
  insights: {
    totalSpent: 2500,
    orderCount: 2,
    averageOrderValue: 1250,
    lastOrderAt: '2026-01-08T12:00:00.000Z',
    addressCount: 1,
    favoriteCount: 3,
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
  },
};

const useAdminCustomerDetailMock = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'cust-1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ id }: { id: string }) => <input id={id} aria-label="วันเกิด" readOnly />,
}));

vi.mock('@/hooks/useAdminCustomers', () => ({
  useAdminCustomerDetail: (...args: unknown[]) => useAdminCustomerDetailMock(...args),
  useUpdateCustomerAsAdmin: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
  useSetCustomerActive: () => ({
    mutate: setActiveMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('AdminCustomerEditPage', () => {
  beforeEach(() => {
    useAdminCustomerDetailMock.mockReturnValue({
      data: mockCustomer,
      isLoading: false,
      error: null,
    });
  });

  it('renders customer insights, account info, and order history', () => {
    render(<AdminCustomerEditPage />);

    expect(screen.getByRole('heading', { name: 'สมชาย ใจดี' })).toBeInTheDocument();
    expect(screen.getByText('0812345678')).toBeInTheDocument();
    expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument();
    expect(screen.getByText('ยืนยันแล้ว')).toBeInTheDocument();
    expect(screen.getByText('ยอดใช้จ่ายรวม')).toBeInTheDocument();
    expect(screen.getByText('จำนวนคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByText('ที่อยู่ที่บันทึก')).toBeInTheDocument();
    expect(screen.getByText('สินค้าที่ชอบ')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('อาหารสุนัขพรีเมียม')).toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อ-นามสกุล')).toHaveValue('สมชาย ใจดี');
    expect(screen.getByRole('link', { name: 'กลับรายการลูกค้า' })).toHaveAttribute(
      'href',
      '/admin/customers',
    );
  });

  it('shows a skeleton while loading', () => {
    useAdminCustomerDetailMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AdminCustomerEditPage />);

    expect(screen.getByLabelText('กำลังโหลดรายละเอียดลูกค้า')).toBeInTheDocument();
  });

  it('shows an error with a recovery link when the customer is missing', () => {
    useAdminCustomerDetailMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('โหลดไม่สำเร็จ'),
    });

    render(<AdminCustomerEditPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดไม่สำเร็จ');
    expect(screen.getByRole('link', { name: 'กลับรายการลูกค้า' })).toHaveAttribute(
      'href',
      '/admin/customers',
    );
  });
});
