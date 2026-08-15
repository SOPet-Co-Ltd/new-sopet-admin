import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminStorePayoutPanel } from '@/components/admin/admin-store-payout-panel';
import { VendorPayoutBalancePanel } from '@/components/vendor/vendor-payout-balance-panel';
import { VendorPayoutSnapshot } from '@/components/vendor/vendor-payout-snapshot';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import AdminStoreEditPage from './page';
import {
  createUseUpdateStoreAsAdminMockResult,
  customZeroRateStore,
  mixedCutoffAvailableSummary,
  mixedCutoffFours,
  nullRateStore,
  type PayoutSummaryCommissionFixture,
} from './store-commission.fixtures';

const HINT_DEFAULT =
  'ค่าเริ่มต้นของแพลตฟอร์มคือ 7% หากไม่กำหนดอัตราเฉพาะร้าน · 0% หมายถึงไม่หักค่าคอมมิชชัน';
const HINT_CUSTOM = 'อัตรานี้ใช้กับยอดสินค้าหลังวันเปิดใช้สูตรใหม่เท่านั้น — ไม่หักจากค่าจัดส่ง';
const RANGE_ERROR = 'กรุณากรอกอัตรา 0 ถึง 100';
const INVALID_ERROR = 'กรุณากรอกตัวเลขเปอร์เซ็นต์ที่ถูกต้อง';

const storeState = { current: nullRateStore };
const mutateAsync = vi.fn();
const mockPush = vi.fn();
const payoutsQueryState: {
  summary: PayoutSummaryCommissionFixture | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} = {
  summary: null,
  isLoading: false,
  isError: false,
  error: null,
};
const ownerState = { isOwner: true };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'store-1' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useAdminStores', () => ({
  useAdminStore: () => ({
    data: storeState.current,
    isLoading: false,
    error: null,
  }),
  useUpdateStoreAsAdmin: () =>
    createUseUpdateStoreAsAdminMockResult({
      mutateAsync,
    }),
}));

vi.mock('@/hooks/useAdminVendors', () => ({
  useAdminVendor: () => ({ data: undefined }),
}));

vi.mock('@/hooks/usePayouts', () => ({
  useAdminStorePayoutSummary: () => ({
    data: payoutsQueryState.summary,
    isLoading: payoutsQueryState.isLoading,
  }),
  useAdminStorePayouts: () => ({ data: [], isLoading: false }),
  useStorePayoutSummary: () => ({
    data: payoutsQueryState.summary,
    isLoading: payoutsQueryState.isLoading,
    isError: payoutsQueryState.isError,
    error: payoutsQueryState.error,
    refetch: vi.fn(),
  }),
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
  useRequestPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
  useRequestManualPayout: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: () => ({ isOwner: ownerState.isOwner }),
}));

vi.mock('@/hooks/useStoreSettings', () => ({
  useMyStore: () => ({
    data: { omiseRecipientStatus: 'active', bankAccountNumber: '1234567890' },
    isLoading: false,
  }),
}));

vi.mock('@/components/admin/vendor-combobox', () => ({
  VendorCombobox: () => <input aria-label="เจ้าของร้านค้า" readOnly />,
}));

function rateInput() {
  return screen.getByLabelText(/อัตราค่าคอมมิชชัน/);
}

async function renderEditPage() {
  render(<AdminStoreEditPage />);
  await waitFor(() => {
    expect(rateInput()).toBeInTheDocument();
  });
}

async function submitStoreForm() {
  await userEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }));
}

function lastMutationInput(): Record<string, unknown> | undefined {
  const call = mutateAsync.mock.calls.at(-1)?.[0] as
    { id: string; input: Record<string, unknown> } | undefined;
  return call?.input;
}

function resetPayoutsQueryState() {
  payoutsQueryState.summary = null;
  payoutsQueryState.isLoading = false;
  payoutsQueryState.isError = false;
  payoutsQueryState.error = null;
}

function assertAvailableFours(netLabel: string) {
  const product = screen.getAllByText(commissionCopy.breakdown.productSold)[0];
  const shipping = screen.getAllByText(commissionCopy.breakdown.shippingFees)[0];
  const commission = screen.getAllByText(commissionCopy.breakdown.commissionDeducted)[0];
  const net = screen.getAllByText(netLabel)[0];

  expect(product.compareDocumentPosition(shipping) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(
    shipping.compareDocumentPosition(commission) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(commission.compareDocumentPosition(net) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  expect(screen.getAllByText(formatCurrency(mixedCutoffFours.productSold)).length).toBeGreaterThan(
    0,
  );
  expect(screen.getAllByText(formatCurrency(mixedCutoffFours.shippingFees)).length).toBeGreaterThan(
    0,
  );
  expect(
    screen.getAllByText(formatCurrency(mixedCutoffFours.commissionAmount)).length,
  ).toBeGreaterThan(0);
  expect(screen.getAllByText(formatCurrency(mixedCutoffFours.net)).length).toBeGreaterThan(0);
  expect(screen.getAllByText(commissionCopy.breakdown.hint.combined).length).toBeGreaterThan(0);
  expect(screen.queryByText(/ก่อนเปิดใช้/)).not.toBeInTheDocument();
  expect(screen.queryByText(/หลังเปิดใช้/)).not.toBeInTheDocument();
  expect(screen.queryByText(commissionCopy.breakdown.hint.frozen)).not.toBeInTheDocument();
}

describe('store commission — admin store-detail rate field [integration]', () => {
  beforeEach(() => {
    storeState.current = nullRateStore;
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(nullRateStore);
    mockPush.mockReset();
    resetPayoutsQueryState();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows default 7 for a null rate, saves a dirty 0–100 integer, and omits a clean null rate', async () => {
    await renderEditPage();

    expect(rateInput()).toHaveValue(7);
    expect(screen.getByText(HINT_DEFAULT)).toBeInTheDocument();
    expect(screen.queryByText(HINT_CUSTOM)).not.toBeInTheDocument();
    expect(screen.queryByText('บันทึกอัตราค่าคอมมิชชันแล้ว')).not.toBeInTheDocument();

    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '5');
    await submitStoreForm();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
    expect(lastMutationInput()?.commissionRate).toBe(5);
    expect(mockPush).toHaveBeenCalledWith('/admin/stores');

    cleanup();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(nullRateStore);
    mockPush.mockReset();
    storeState.current = nullRateStore;
    await renderEditPage();

    await userEvent.clear(screen.getByLabelText(/ชื่อร้านค้า/));
    await userEvent.type(screen.getByLabelText(/ชื่อร้านค้า/), 'Renamed Shop');
    await submitStoreForm();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
    expect(lastMutationInput()).toBeDefined();
    expect(lastMutationInput()).not.toHaveProperty('commissionRate');
    expect(mockPush).toHaveBeenCalledWith('/admin/stores');

    cleanup();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(customZeroRateStore);
    mockPush.mockReset();
    storeState.current = customZeroRateStore;
    await renderEditPage();

    expect(rateInput()).toHaveValue(0);
    expect(screen.getByText(HINT_CUSTOM)).toBeInTheDocument();
    expect(screen.queryByText(HINT_DEFAULT)).not.toBeInTheDocument();

    cleanup();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({ ...nullRateStore, commissionRate: 0 });
    mockPush.mockReset();
    storeState.current = nullRateStore;
    await renderEditPage();

    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '0');
    await submitStoreForm();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
    expect(lastMutationInput()?.commissionRate).toBe(0);
    expect(mockPush).toHaveBeenCalledWith('/admin/stores');

    cleanup();
    mutateAsync.mockReset();
    mockPush.mockReset();
    storeState.current = nullRateStore;
    await renderEditPage();

    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '101');
    await submitStoreForm();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert').textContent).toMatch(
      new RegExp(`${RANGE_ERROR}|${INVALID_ERROR}`),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '7.5');
    await submitStoreForm();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert').textContent).toMatch(
      new RegExp(`${RANGE_ERROR}|${INVALID_ERROR}`),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('store commission — available-balance fours [FE-INT-1-available]', () => {
  beforeEach(() => {
    resetPayoutsQueryState();
    payoutsQueryState.summary = mixedCutoffAvailableSummary;
    ownerState.isOwner = true;
  });

  afterEach(() => {
    cleanup();
    resetPayoutsQueryState();
  });

  it('shows the same fixture fours on admin panel, vendor balance, and vendor snapshot and binds availableBalance', () => {
    const { unmount: unmountAdmin } = render(<AdminStorePayoutPanel storeId="store-1" />);
    assertAvailableFours(commissionCopy.breakdown.netPayable.admin);
    expect(
      screen.getByRole('button', { name: `Trigger Omise (${formatCurrency(1410)})` }),
    ).toBeInTheDocument();
    expect(screen.queryByText('ยอดสุทธิที่ได้รับ')).not.toBeInTheDocument();
    unmountAdmin();

    const { unmount: unmountBalance } = render(<VendorPayoutBalancePanel />);
    assertAvailableFours(commissionCopy.breakdown.netPayable.vendor);
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
    unmountBalance();

    render(<VendorPayoutSnapshot />);
    assertAvailableFours(commissionCopy.breakdown.netPayable.vendor);
    expect(screen.getAllByText(commissionCopy.breakdown.productSold).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
  });

  it('does not invent fours when the vendor summary errors', () => {
    payoutsQueryState.summary = null;
    payoutsQueryState.isError = true;
    payoutsQueryState.error = new Error('summary unavailable');

    render(<VendorPayoutBalancePanel />);

    expect(screen.getByText('โหลดยอด payout ไม่สำเร็จ')).toBeInTheDocument();
    expect(screen.queryByText(commissionCopy.breakdown.productSold)).not.toBeInTheDocument();
    expect(screen.queryByText(commissionCopy.breakdown.commissionDeducted)).not.toBeInTheDocument();
    expect(screen.queryByText(formatCurrency(0))).not.toBeInTheDocument();
  });
});
