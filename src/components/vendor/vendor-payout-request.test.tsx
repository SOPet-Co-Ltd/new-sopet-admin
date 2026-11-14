import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import type { BankAccountVerificationStatus, PayoutSummary } from '@/types';
import { VendorPayoutBalancePanel } from './vendor-payout-balance-panel';
import { VendorPayoutSnapshot } from './vendor-payout-snapshot';

const eligibleSummary: PayoutSummary = {
  storeId: 'store-1',
  grossRevenue: 2000,
  totalPaidOut: 0,
  availableBalance: 1860,
  pendingPayoutAmount: 0,
  minimumPayoutAmount: 100,
  canRequestPayout: true,
  productSold: 2000,
  shippingFees: 0,
  commissionAmount: 140,
  commissionRate: 7,
};

const storeState: {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankAccountVerificationStatus: BankAccountVerificationStatus;
} = {
  bankName: 'ธนาคารกสิกรไทย',
  bankAccountName: 'Test Account',
  bankAccountNumber: '1234567890',
  bankAccountVerificationStatus: 'verified',
};

const summaryState: { summary: PayoutSummary } = {
  summary: eligibleSummary,
};

vi.mock('@/hooks/usePayouts', () => ({
  useStorePayoutSummary: () => ({
    data: summaryState.summary,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useRequestPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: () => ({ isOwner: true }),
}));

vi.mock('@/hooks/useStoreSettings', () => ({
  useMyStore: () => ({
    data: { ...storeState },
    isLoading: false,
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('vendor payout request — bank verification gate', () => {
  beforeEach(() => {
    storeState.bankName = 'ธนาคารกสิกรไทย';
    storeState.bankAccountName = 'Test Account';
    storeState.bankAccountNumber = '1234567890';
    storeState.bankAccountVerificationStatus = 'verified';
    summaryState.summary = {
      ...eligibleSummary,
      canRequestPayout: true,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it.each(['unverified', 'pending_review', 'rejected'] as BankAccountVerificationStatus[])(
    'disables request and shows not-verified message when status is %s (balance panel)',
    (status) => {
      storeState.bankAccountVerificationStatus = status;
      summaryState.summary = {
        ...eligibleSummary,
        canRequestPayout: false,
      };

      render(<VendorPayoutBalancePanel />);

      const button = screen.getByRole('button', { name: 'ขอรับเงิน' });
      expect(button).toBeDisabled();
      expect(screen.getByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_VERIFIED)).toBeInTheDocument();
    },
  );

  it('disables request and shows not-verified message for pending_review on snapshot', () => {
    storeState.bankAccountVerificationStatus = 'pending_review';
    summaryState.summary = {
      ...eligibleSummary,
      canRequestPayout: false,
    };

    render(<VendorPayoutSnapshot />);

    const button = screen.getByRole('button', { name: 'ขอรับเงิน' });
    expect(button).toBeDisabled();
    expect(screen.getByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_VERIFIED)).toBeInTheDocument();
  });

  it.each(['unverified', 'rejected'] as BankAccountVerificationStatus[])(
    'disables request and shows not-verified message when status is %s (snapshot)',
    (status) => {
      storeState.bankAccountVerificationStatus = status;
      summaryState.summary = {
        ...eligibleSummary,
        canRequestPayout: false,
      };

      render(<VendorPayoutSnapshot />);

      const button = screen.getByRole('button', { name: 'ขอรับเงิน' });
      expect(button).toBeDisabled();
      expect(screen.getByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_VERIFIED)).toBeInTheDocument();
    },
  );

  it('keeps request enabled and hides not-verified message when verified', () => {
    storeState.bankAccountVerificationStatus = 'verified';
    summaryState.summary = {
      ...eligibleSummary,
      canRequestPayout: true,
    };

    const { unmount: unmountBalance } = render(<VendorPayoutBalancePanel />);
    expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeEnabled();
    expect(screen.queryByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_VERIFIED)).not.toBeInTheDocument();
    unmountBalance();

    render(<VendorPayoutSnapshot />);
    expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeEnabled();
    expect(screen.queryByText(ERROR_MESSAGES.BANK_ACCOUNT_NOT_VERIFIED)).not.toBeInTheDocument();
  });
});
