import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  useCancelPayoutRequest: () => ({
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

describe('vendor payout request — saved bank account is enough', () => {
  beforeEach(() => {
    storeState.bankName = 'ธนาคารกสิกรไทย';
    storeState.bankAccountName = 'Test Account';
    storeState.bankAccountNumber = '1234567890';
    storeState.bankAccountVerificationStatus = 'unverified';
    summaryState.summary = {
      ...eligibleSummary,
      canRequestPayout: true,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    'unverified',
    'pending_review',
    'rejected',
    'verified',
  ] as BankAccountVerificationStatus[])(
    'enables request on the balance panel when the account is saved and status is %s',
    (status) => {
      storeState.bankAccountVerificationStatus = status;

      render(<VendorPayoutBalancePanel />);

      expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeEnabled();
      expect(screen.queryByText('บัญชีธนาคารยังไม่ผ่านการตรวจสอบ')).not.toBeInTheDocument();
    },
  );

  it.each([
    'unverified',
    'pending_review',
    'rejected',
    'verified',
  ] as BankAccountVerificationStatus[])(
    'enables request on the snapshot when the account is saved and status is %s',
    (status) => {
      storeState.bankAccountVerificationStatus = status;

      render(<VendorPayoutSnapshot />);

      expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeEnabled();
      expect(screen.queryByText('บัญชีธนาคารยังไม่ผ่านการตรวจสอบ')).not.toBeInTheDocument();
    },
  );

  it('keeps request disabled until a bank account is saved', () => {
    storeState.bankName = '';
    storeState.bankAccountName = '';
    storeState.bankAccountNumber = '';
    summaryState.summary = {
      ...eligibleSummary,
      canRequestPayout: false,
    };

    const { unmount } = render(<VendorPayoutBalancePanel />);
    expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeDisabled();
    expect(screen.getByText(/ยังไม่ได้บันทึกบัญชีธนาคาร/)).toBeInTheDocument();
    unmount();

    render(<VendorPayoutSnapshot />);
    expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeDisabled();
    expect(screen.getByText(/ยังไม่ได้ตั้งบัญชีรับเงิน/)).toBeInTheDocument();
  });

  it('offers cancel while a payout request is waiting for admin', () => {
    summaryState.summary = {
      ...eligibleSummary,
      availableBalance: 0,
      pendingPayoutAmount: 2927.16,
      canRequestPayout: false,
    };

    render(<VendorPayoutBalancePanel />);

    expect(screen.getByRole('status')).toHaveTextContent('รอแอดมินโอนและอนุมัติ');
    expect(screen.getByRole('status')).toHaveTextContent('฿2,927.16');
    expect(screen.getByRole('button', { name: 'ยกเลิกคำขอ' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'ขอรับเงิน' })).toBeDisabled();
  });
});
