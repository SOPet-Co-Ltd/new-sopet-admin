import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminVendorEditPage from './page';

const mutateAsync = vi.fn();
const updateMutate = vi.fn();

const mockState = vi.hoisted(() => ({
  emailVerified: true,
}));

const mockVendor = {
  id: 'vendor-1',
  email: 'vendor@example.com',
  fullName: 'สมหญิง ร้านดี',
  role: 'vendor',
  isActive: true,
  get emailVerified() {
    return mockState.emailVerified;
  },
  lastLoginAt: '2026-01-10T08:00:00.000Z',
  createdAt: '2025-12-01T10:00:00.000Z',
  stores: [
    {
      id: 'store-1',
      name: 'ร้านสัตว์เลี้ยง',
      slug: 'pet-shop',
      status: 'approved',
    },
  ],
  insights: {
    storeCount: 1,
    membershipCount: 0,
    totalRevenue: 12500,
    orderCount: 8,
    averageOrderValue: 1562.5,
    lastOrderAt: '2026-01-08T12:00:00.000Z',
    lastActivityAt: '2026-01-10T08:00:00.000Z',
    memberships: [],
    activities: [
      {
        kind: 'store_created',
        occurredAt: '2025-12-05T10:00:00.000Z',
        storeId: 'store-1',
        storeName: 'ร้านสัตว์เลี้ยง',
      },
    ],
    recentOrders: [
      {
        id: 'order-1',
        orderNumber: 'ORD-101',
        status: 'paid',
        total: 2500,
        createdAt: '2026-01-08T12:00:00.000Z',
        items: [
          {
            productName: 'อาหารแมวพรีเมียม',
            quantity: 2,
            unitPrice: 1250,
            subtotal: 2500,
          },
        ],
      },
    ],
  },
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'vendor-1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useMutation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  };
});

vi.mock('@/hooks/useAdminVendors', () => ({
  useAdminVendorDetail: () => ({
    data: mockVendor,
    isLoading: false,
    error: null,
  }),
  useUpdateVendorAsAdmin: () => ({
    mutateAsync,
    mutate: updateMutate,
    isPending: false,
  }),
  useAdminResendVendorEmailVerification: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isCooldown: false,
    isResendDisabled: false,
    resendButtonLabel: 'ส่งอีเมลยืนยันอีกครั้ง',
  }),
  useAdminVerifyVendorEmail: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('AdminVendorEditPage', () => {
  it('renders vendor insights, stores, activity log, and order history', () => {
    render(<AdminVendorEditPage />);

    expect(screen.getByRole('heading', { name: 'สมหญิง ร้านดี' })).toBeInTheDocument();
    expect(screen.getByText('vendor@example.com')).toBeInTheDocument();
    expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument();
    expect(screen.getByText('ยืนยันอีเมลแล้ว')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ภาพรวมผู้ขาย/ })).toBeInTheDocument();
    expect(screen.getByText('จำนวนร้านค้า')).toBeInTheDocument();
    expect(screen.getByText('รายได้รวม')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'การดำเนินการบัญชี' })).toBeInTheDocument();
    expect(screen.getAllByText('ร้านสัตว์เลี้ยง').length).toBeGreaterThan(0);
    expect(screen.getByText('บันทึกกิจกรรม')).toBeInTheDocument();
    expect(screen.getByText('สร้างร้านค้า')).toBeInTheDocument();
    expect(screen.getByText('ORD-101')).toBeInTheDocument();
    expect(screen.getByDisplayValue('สมหญิง ร้านดี')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ส่งอีเมลรีเซ็ตรหัสผ่านให้ vendor@example.com' }),
    ).toBeInTheDocument();
  });

  it('shows email verification actions when email is unverified', () => {
    mockState.emailVerified = false;

    render(<AdminVendorEditPage />);

    expect(screen.getByRole('heading', { name: 'ยังไม่ยืนยันอีเมล' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ส่งอีเมลยืนยันอีกครั้ง' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันอีเมลด้วยตนเอง' })).toBeInTheDocument();

    mockState.emailVerified = true;
  });
});
