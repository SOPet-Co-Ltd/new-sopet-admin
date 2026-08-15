import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { print } from 'graphql';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminManualPayoutsPage from '@/app/admin/manual-payouts/page';
import AdminStoreNewPage from '@/app/admin/stores/new/page';
import { buildAdminNavSections } from '@/components/admin/admin-layout';
import { AdminStorePayoutPanel } from '@/components/admin/admin-store-payout-panel';
import { VendorPayoutBalancePanel } from '@/components/vendor/vendor-payout-balance-panel';
import { VendorPayoutHistoryPanel } from '@/components/vendor/vendor-payout-history-panel';
import { VendorPayoutSnapshot } from '@/components/vendor/vendor-payout-snapshot';
import { VendorStoreSettingsPanel } from '@/components/vendor/vendor-store-settings-panel';
import { UPDATE_STORE, UPDATE_STORE_PAYOUT } from '@/lib/graphql/documents';
import { commissionCopy, platformSettingsTabLabels } from '@/lib/i18n/th';
import { formatBreakdownAmount } from '@/lib/payouts/commission-display';
import { formatCurrency } from '@/lib/utils';
import {
  adminStoreFormSchema,
  payoutFormSchema,
  storeInfoFormSchema,
  type StoreInfoFormValues,
} from '@/lib/validations';
import AdminStoreEditPage from './page';
import {
  createPendingManualPayoutsMockResult,
  createUseUpdateStoreAsAdminMockResult,
  customZeroRateStore,
  liveTenPercentAvailableSummary,
  liveTenPercentVsSnapshotSeven,
  mixedCutoffAvailableSummary,
  mixedCutoffFours,
  nullRateStore,
  pendingManualSnapshotPayout,
  snapshotSevenPercentPayout,
  type AdminManualPayoutCommissionFixture,
  type PayoutCommissionFixture,
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
const payoutsHistoryState: { items: PayoutCommissionFixture[] } = { items: [] };
const pendingManualState: { items: AdminManualPayoutCommissionFixture[] } = { items: [] };
const triggerMutate = vi.fn();

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
  useCreateStoreAsAdmin: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
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
  useAdminStorePayouts: () => ({ data: payoutsHistoryState.items, isLoading: false }),
  useStorePayouts: () => ({ data: payoutsHistoryState.items, isLoading: false }),
  useStorePayoutSummary: () => ({
    data: payoutsQueryState.summary,
    isLoading: payoutsQueryState.isLoading,
    isError: payoutsQueryState.isError,
    error: payoutsQueryState.error,
    refetch: vi.fn(),
  }),
  useTriggerPayout: () => ({
    mutate: triggerMutate,
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
  usePendingManualPayouts: () => createPendingManualPayoutsMockResult(pendingManualState.items),
  useSettleManualPayoutForQueue: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
  }),
  useRejectManualPayoutForQueue: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    variables: undefined,
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

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: ({ label }: { label: string }) => <div>{label}</div>,
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

function assertNoRateControl() {
  expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.queryByText(HINT_DEFAULT)).not.toBeInTheDocument();
  expect(document.querySelector('#commissionRate')).toBeNull();
  expect(document.querySelector('[name="commissionRate"]')).toBeNull();
}

function VendorStoreSettingsAbsenceHarness({ loading = false }: { loading?: boolean }) {
  const form = useForm<StoreInfoFormValues>({
    defaultValues: {
      name: 'Shop',
      description: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
      logoUrl: '',
      bannerUrl: '',
    },
  });
  return (
    <VendorStoreSettingsPanel
      form={form}
      loading={loading}
      saving={false}
      onSubmit={async () => undefined}
    />
  );
}

function resetPayoutsQueryState() {
  payoutsQueryState.summary = null;
  payoutsQueryState.isLoading = false;
  payoutsQueryState.isError = false;
  payoutsQueryState.error = null;
  payoutsHistoryState.items = [];
  pendingManualState.items = [];
  triggerMutate.mockReset();
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

function assertSnapshotFours(netLabel: string) {
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
  expect(screen.getAllByText(commissionCopy.breakdown.hint.frozen).length).toBeGreaterThan(0);
  expect(screen.queryByText(/ก่อนเปิดใช้/)).not.toBeInTheDocument();
  expect(screen.queryByText(/หลังเปิดใช้/)).not.toBeInTheDocument();
  expect(document.querySelector('details')).toBeNull();
  expect(screen.queryByText('netAmount')).not.toBeInTheDocument();
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

describe('store commission — four-number breakdown [integration]', () => {
  beforeEach(() => {
    resetPayoutsQueryState();
    payoutsQueryState.summary = mixedCutoffAvailableSummary;
    payoutsHistoryState.items = [snapshotSevenPercentPayout];
    pendingManualState.items = [pendingManualSnapshotPayout];
    ownerState.isOwner = true;
  });

  afterEach(() => {
    cleanup();
    resetPayoutsQueryState();
  });

  it('shows the same combined fours on admin and vendor and binds only the already-net transfer', () => {
    const { unmount: unmountAdmin } = render(<AdminStorePayoutPanel storeId="store-1" />);
    assertSnapshotFours(commissionCopy.breakdown.netPayable.admin);
    expect(
      screen.getByRole('button', { name: `Trigger Omise (${formatCurrency(1410)})` }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /฿1,400/ })).not.toBeInTheDocument();
    unmountAdmin();

    const { unmount: unmountQueue } = render(<AdminManualPayoutsPage />);
    assertSnapshotFours(commissionCopy.breakdown.netPayable.admin);
    expect(screen.getByText(commissionCopy.transfer.caption)).toBeInTheDocument();
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
    expect(screen.queryByText(formatCurrency(1400))).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /อนุมัติหลังโอนแล้ว.*฿1,400/ }),
    ).not.toBeInTheDocument();
    unmountQueue();

    const { unmount: unmountBalance } = render(<VendorPayoutBalancePanel />);
    assertAvailableFours(commissionCopy.breakdown.netPayable.vendor);
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
    unmountBalance();

    const { unmount: unmountHistory } = render(<VendorPayoutHistoryPanel />);
    assertSnapshotFours(commissionCopy.breakdown.netPayable.vendor);
    expect(screen.queryByText(commissionCopy.breakdown.netPayable.admin)).not.toBeInTheDocument();
    unmountHistory();

    render(<VendorPayoutSnapshot />);
    assertAvailableFours(commissionCopy.breakdown.netPayable.vendor);
    expect(screen.getAllByText(commissionCopy.breakdown.productSold).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
  });
});

describe('store commission — snapshot bind and omit-amount trigger [integration]', () => {
  beforeEach(() => {
    resetPayoutsQueryState();
    payoutsQueryState.summary = liveTenPercentAvailableSummary;
    payoutsHistoryState.items = [
      liveTenPercentVsSnapshotSeven.snapshotPayout,
      liveTenPercentVsSnapshotSeven.historicalNullPayout,
    ];
    ownerState.isOwner = true;
  });

  afterEach(() => {
    cleanup();
    resetPayoutsQueryState();
  });

  it('binds snapshotted fours (or —) and triggers Omise without an amount', async () => {
    expect(formatBreakdownAmount(null)).toBe('—');
    expect(formatBreakdownAmount(null)).not.toBe(formatCurrency(0));

    const { unmount: unmountAdmin } = render(<AdminStorePayoutPanel storeId="store-1" />);

    expect(screen.getAllByText(formatCurrency(70)).length).toBeGreaterThan(0);
    expect(screen.queryByText(formatCurrency(140))).not.toBeInTheDocument();
    expect(screen.getAllByText(commissionCopy.breakdown.hint.frozen).length).toBeGreaterThan(0);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('status').textContent).toMatch(/ไม่ครบถ้วน/);
    expect(screen.getAllByText(formatCurrency(1410)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/PAYOUT_AMOUNT_MISMATCH/)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: `Trigger Omise (${formatCurrency(1410)})` }),
    );
    expect(triggerMutate).toHaveBeenCalledWith(undefined);
    expect(triggerMutate.mock.calls[0]?.[0]).toBeUndefined();
    unmountAdmin();

    render(<VendorPayoutHistoryPanel />);
    expect(screen.getAllByText(commissionCopy.breakdown.netPayable.vendor).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(formatCurrency(70)).length).toBeGreaterThan(0);
    expect(screen.queryByText(formatCurrency(140))).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getAllByText(commissionCopy.breakdown.hint.frozen).length).toBeGreaterThan(0);
  });
});

describe('store commission — absence locks [AC-004 / AC-005 / AC-F-003c / AC-F-004 / AC-F-005]', () => {
  afterEach(() => {
    cleanup();
  });

  it('has no /admin/commissions nav item or settings default-rate editor', () => {
    const navHrefs = buildAdminNavSections().flatMap((section) =>
      section.items.map((item) => item.href),
    );
    expect(navHrefs).not.toContain('/admin/commissions');
    expect(navHrefs).toContain('/admin/settings');
    expect(navHrefs).toContain('/admin/manual-payouts');
    expect(navHrefs.some((href) => /commission/i.test(href))).toBe(false);

    expect(Object.keys(platformSettingsTabLabels)).toEqual([
      'banners',
      'sponsors',
      'ads',
      'loginImages',
      'bankTransfer',
    ]);
    expect(JSON.stringify(platformSettingsTabLabels)).not.toMatch(/คอมมิชชัน|commission/i);
  });

  it('keeps /admin/stores/new and the shared create schema rate-free', () => {
    render(<AdminStoreNewPage />);
    assertNoRateControl();
    expect(screen.getByRole('button', { name: 'สร้างร้านค้า' })).toBeInTheDocument();

    const payload = {
      name: 'Pet Shop',
      ownerId: '11111111-1111-4111-8111-111111111111',
    };
    expect('commissionRate' in adminStoreFormSchema.shape).toBe(false);
    const parsed = adminStoreFormSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect('commissionRate' in parsed.data).toBe(false);
    }
  });

  it('shows no vendor rate control on store settings default or loading', () => {
    const { unmount } = render(<VendorStoreSettingsAbsenceHarness />);
    expect(screen.getByLabelText(/ชื่อร้านค้า/)).toBeInTheDocument();
    assertNoRateControl();
    unmount();

    render(<VendorStoreSettingsAbsenceHarness loading />);
    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    assertNoRateControl();
  });

  it('omits commissionRate from vendor store and payout write documents and schemas', () => {
    expect(print(UPDATE_STORE)).not.toMatch(/commissionRate/);
    expect(print(UPDATE_STORE_PAYOUT)).not.toMatch(/commissionRate/);
    expect('commissionRate' in storeInfoFormSchema.shape).toBe(false);
    expect('commissionRate' in payoutFormSchema.shape).toBe(false);
  });

  it('sends only { status } on a status-only store update', async () => {
    storeState.current = nullRateStore;
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({ ...nullRateStore, status: 'approved' });

    render(<AdminStoreEditPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'อนุมัติเปิดใช้งาน' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'อนุมัติเปิดใช้งาน' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      id: 'store-1',
      input: { status: 'approved' },
    });
    expect(lastMutationInput()).toEqual({ status: 'approved' });
    expect(lastMutationInput()).not.toHaveProperty('commissionRate');
  });
});
