import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminStoreEditPage from './page';

const mutateAsync = vi.fn();
const mockPush = vi.fn();

const mockStore = {
  id: 'store-1',
  name: 'SOPet Pet Shop',
  slug: 'sopet-pet-shop',
  description: 'Test store',
  status: 'pending',
  contactPhone: '0812345678',
  contactEmail: 'shop@example.com',
  address: 'Bangkok',
  ownerId: 'vendor-1',
  ownerEmail: 'vendor@sopet.org',
  ownerFullName: 'Vendor SOPet',
  createdAt: '2026-01-01T00:00:00.000Z',
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'store-1' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useAdminStores', () => ({
  useAdminStore: () => ({
    data: mockStore,
    isLoading: false,
    error: null,
  }),
  useUpdateStoreAsAdmin: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
  useLinkStoreOmiseRecipientAsAdmin: () => ({
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAdminVendors', () => ({
  useAdminVendor: () => ({ data: undefined }),
}));

vi.mock('@/hooks/usePayouts', () => ({
  useAdminStorePayoutSummary: () => ({ data: null, isLoading: false }),
  useAdminStorePayouts: () => ({ data: [], isLoading: false }),
  useTriggerPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
  useSettleManualPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
  useRejectManualPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

vi.mock('@/components/admin/vendor-combobox', () => ({
  VendorCombobox: () => <input aria-label="เจ้าของร้านค้า" readOnly />,
}));

vi.mock('@/hooks/useCustomerSummaries', () => ({
  useStoreCustomerSummary: () => ({
    data: {
      year: 2026,
      month: 3,
      lifetimeMonths: 20,
      repeatRate: 0.4,
      purchasesPerMonth: 0.18,
      averageOrderValue: 700,
      newCustomerCount: 70,
      oldCustomerCount: 30,
      oldCustomerPercent: 0.3,
      orderCount: 36,
      buyersInMonth: 100,
      totalCustomers: 200,
    },
    isLoading: false,
    error: null,
  }),
  useCustomerPurchaseSummary: vi.fn(),
}));

describe('AdminStoreEditPage', () => {
  it('shows prominent approval actions for pending stores', () => {
    render(<AdminStoreEditPage />);

    expect(screen.getByRole('heading', { name: 'ร้านค้ารออนุมัติ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'อนุมัติเปิดใช้งาน' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ปฏิเสธร้านค้า' })).toBeInTheDocument();
    expect(screen.getAllByText('รออนุมัติ').length).toBeGreaterThan(0);
  });

  it('renders the store customer summary card', () => {
    render(<AdminStoreEditPage />);

    expect(screen.getByRole('heading', { name: 'สรุปลูกค้าของร้าน' })).toBeInTheDocument();
    expect(screen.getByText('Customer Lifetime (เดือน)')).toBeInTheDocument();
    expect(screen.getByText('New Customer (ลูกค้าใหม่)')).toBeInTheDocument();
  });

  it('calls status update when approving a pending store', async () => {
    mutateAsync.mockResolvedValueOnce({ ...mockStore, status: 'approved' });
    render(<AdminStoreEditPage />);

    await userEvent.click(screen.getByRole('button', { name: 'อนุมัติเปิดใช้งาน' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      id: 'store-1',
      input: { status: 'approved' },
    });
  });
});
