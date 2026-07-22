import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VendorRequestsPage from '@/app/vendor/requests/page';

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueries: vi.fn(() => []),
  };
});

vi.mock('@/hooks/useTeam', () => ({
  useMyPendingStoreInvitations: vi.fn(),
  useAcceptStoreInvitation: vi.fn(),
  useDeclineStoreInvitation: vi.fn(),
}));

vi.mock('@/hooks/useStoreRequests', () => ({
  useMyStoreRequests: vi.fn(),
}));

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ show: vi.fn() }),
}));

import {
  useAcceptStoreInvitation,
  useDeclineStoreInvitation,
  useMyPendingStoreInvitations,
} from '@/hooks/useTeam';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import { useMyStores } from '@/hooks/useMyStores';

const mockedUseMyPendingStoreInvitations = vi.mocked(useMyPendingStoreInvitations);
const mockedUseAcceptStoreInvitation = vi.mocked(useAcceptStoreInvitation);
const mockedUseDeclineStoreInvitation = vi.mocked(useDeclineStoreInvitation);
const mockedUseMyStoreRequests = vi.mocked(useMyStoreRequests);
const mockedUseMyStores = vi.mocked(useMyStores);

describe('VendorRequestsPage', () => {
  const acceptMutateAsync = vi.fn();
  const declineMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAcceptStoreInvitation.mockReturnValue({
      mutateAsync: acceptMutateAsync,
    } as unknown as ReturnType<typeof useAcceptStoreInvitation>);
    mockedUseDeclineStoreInvitation.mockReturnValue({
      mutateAsync: declineMutateAsync,
    } as unknown as ReturnType<typeof useDeclineStoreInvitation>);
    mockedUseMyStores.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useMyStores>);
    mockedUseMyStoreRequests.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyStoreRequests>);
  });

  it('lists pending invitations and accepts one', async () => {
    const user = userEvent.setup();
    mockedUseMyPendingStoreInvitations.mockReturnValue({
      data: [
        {
          id: 'inv-1',
          storeId: 'store-1',
          storeName: 'Happy Pets',
          role: 'staff',
          status: 'pending',
          expiresAt: '2030-01-01T00:00:00.000Z',
          token: 'token-1',
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyPendingStoreInvitations>);
    acceptMutateAsync.mockResolvedValue({});

    render(<VendorRequestsPage />);

    expect(screen.getByText('Happy Pets')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ตอบรับ' }));

    await waitFor(() => {
      expect(acceptMutateAsync).toHaveBeenCalledWith('token-1');
    });
  });

  it('declines a pending invitation', async () => {
    const user = userEvent.setup();
    mockedUseMyPendingStoreInvitations.mockReturnValue({
      data: [
        {
          id: 'inv-1',
          storeId: 'store-1',
          storeName: 'Happy Pets',
          role: 'manager',
          status: 'pending',
          expiresAt: '2030-01-01T00:00:00.000Z',
          token: 'token-2',
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyPendingStoreInvitations>);
    declineMutateAsync.mockResolvedValue(true);

    render(<VendorRequestsPage />);

    await user.click(screen.getByRole('button', { name: 'ปฏิเสธ' }));

    await waitFor(() => {
      expect(declineMutateAsync).toHaveBeenCalledWith('token-2');
    });
  });

  it('shows pending store requests under คำขอของฉัน', () => {
    mockedUseMyPendingStoreInvitations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyPendingStoreInvitations>);
    mockedUseMyStoreRequests.mockReturnValue({
      data: [
        {
          id: 'req-1',
          name: 'New Store',
          status: 'pending',
          createdAt: '2030-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyStoreRequests>);

    render(<VendorRequestsPage />);

    expect(screen.getByText('New Store')).toBeInTheDocument();
    expect(screen.getByText('รออนุมัติ')).toBeInTheDocument();
  });
});
