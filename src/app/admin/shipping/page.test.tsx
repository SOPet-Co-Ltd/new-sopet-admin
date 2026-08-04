import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminShippingPage from './page';

vi.mock('@/hooks/useShipping', () => ({
  useShippingProviders: () => ({
    data: [
      { id: 'p1', name: 'Kerry', isActive: true },
      { id: 'p2', name: 'Flash Express', isActive: false },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateShippingProvider: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useUpdateShippingProvider: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useDeleteShippingProvider: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAdminStoreShippingOptions: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useAdminCreateStoreShippingOption: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAdminUpdateStoreShippingOption: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useAdminDeleteStoreShippingOption: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAdminStores', () => ({
  useAdminStores: () => ({
    data: [{ id: 'store-1', name: 'SOPet Pet Shop' }],
    isLoading: false,
  }),
}));

describe('AdminShippingPage', () => {
  it('renders shipping sections with Trust Desk copy and provider list', () => {
    render(<AdminShippingPage />);

    expect(screen.getByRole('heading', { name: 'การจัดส่ง', level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/ข้อมูลต้องชัดเจนและตรงกับที่ลูกค้าเห็นตอนชำระเงิน/),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ผู้ให้บริการจัดส่ง' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ราคาจัดส่งของร้านค้า' })).toBeInTheDocument();
    expect(screen.getByText('Kerry')).toBeInTheDocument();
    expect(screen.getByText('Flash Express')).toBeInTheDocument();
    expect(screen.getByText('ใช้งาน')).toBeInTheDocument();
    expect(screen.getByText('ปิดใช้งาน')).toBeInTheDocument();
    expect(screen.getByText('เลือกร้านค้าก่อน')).toBeInTheDocument();
  });
});
