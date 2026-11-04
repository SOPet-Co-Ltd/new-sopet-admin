import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCustomerAddressesPanel } from './admin-customer-addresses-panel';

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();
const mutateDelete = vi.fn();
const mutateDefault = vi.fn();

vi.mock('@/hooks/useAdminCustomers', () => ({
  useAdminCustomerAddresses: () => ({
    data: [
      {
        id: 'addr-1',
        label: 'บ้าน',
        fullName: 'สมชาย',
        phone: '0812345678',
        addressLine1: '123 ถนนสุขุมวิท',
        addressLine2: null,
        tumbon: 'คลองเตย',
        amphoe: 'คลองเตย',
        province: 'กรุงเทพมหานคร',
        postalCode: '10110',
        isDefault: true,
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateCustomerAddressAsAdmin: () => ({
    mutateAsync: mutateCreate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdateCustomerAddressAsAdmin: () => ({
    mutateAsync: mutateUpdate,
    isPending: false,
    isError: false,
    error: null,
  }),
  useDeleteCustomerAddressAsAdmin: () => ({
    mutateAsync: mutateDelete,
    isPending: false,
    isError: false,
    error: null,
  }),
  useSetCustomerDefaultAddressAsAdmin: () => ({
    mutateAsync: mutateDefault,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AdminCustomerAddressesPanel customerId="cust-1" />
    </QueryClientProvider>,
  );
}

describe('AdminCustomerAddressesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateCreate.mockResolvedValue({});
    mutateUpdate.mockResolvedValue({});
    mutateDelete.mockResolvedValue(true);
    mutateDefault.mockResolvedValue({});
  });

  it('lists saved addresses and opens the create dialog', async () => {
    const user = userEvent.setup();
    renderPanel();

    expect(screen.getByText(/บ้าน · สมชาย/)).toBeInTheDocument();
    expect(screen.getByText(/123 ถนนสุขุมวิท/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'เพิ่มที่อยู่' }));
    expect(screen.getByRole('heading', { name: 'เพิ่มที่อยู่' })).toBeInTheDocument();
  });

  it('opens edit dialog with existing values', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'แก้ไข' }));
    expect(screen.getByRole('heading', { name: 'แก้ไขที่อยู่' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('บ้าน')).toBeInTheDocument();
    expect(screen.getByDisplayValue('สมชาย')).toBeInTheDocument();
  });

  it('confirms delete before calling mutation', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'ลบ' }));
    expect(screen.getByRole('heading', { name: 'ลบที่อยู่' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ลบที่อยู่' }));

    await waitFor(() => {
      expect(mutateDelete).toHaveBeenCalledWith('addr-1');
    });
  });
});
