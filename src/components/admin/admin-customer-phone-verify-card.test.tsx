import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCustomerPhoneVerifyCard } from './admin-customer-phone-verify-card';

const mutateVerify = vi.fn();

vi.mock('@/hooks/useAdminCustomers', () => ({
  useVerifyCustomerPhoneAsAdmin: () => ({
    mutateAsync: mutateVerify,
    isPending: false,
  }),
}));

function renderCard(isVerified = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AdminCustomerPhoneVerifyCard
        customerId="cust-1"
        phone="0812345678"
        isVerified={isVerified}
      />
    </QueryClientProvider>,
  );
}

describe('AdminCustomerPhoneVerifyCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateVerify.mockResolvedValue({ isVerified: true });
  });

  it('hides verify controls when already verified', () => {
    renderCard(true);
    expect(screen.queryByText('ยังไม่ยืนยันเบอร์โทรศัพท์')).not.toBeInTheDocument();
  });

  it('confirms before verifying an unverified phone', async () => {
    const user = userEvent.setup();
    renderCard(false);

    expect(screen.getByText('ยังไม่ยืนยันเบอร์โทรศัพท์')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ยืนยันเบอร์โทรด้วยตนเอง' }));
    expect(screen.getByRole('heading', { name: 'ยืนยันเบอร์โทรด้วยตนเอง' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ยืนยันเบอร์โทร' }));
    await waitFor(() => {
      expect(mutateVerify).toHaveBeenCalledWith('cust-1');
    });
    expect(await screen.findByText('ยืนยันเบอร์โทรศัพท์แล้ว')).toBeInTheDocument();
  });
});
