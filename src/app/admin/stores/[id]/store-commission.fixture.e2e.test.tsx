import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminManualPayoutsPage from '@/app/admin/manual-payouts/page';
import AdminPlatformSettingsPage from '@/app/admin/settings/page';
import AdminStoreNewPage from '@/app/admin/stores/new/page';
import { AdminStorePayoutPanel } from '@/components/admin/admin-store-payout-panel';
import { buildAdminNavSections } from '@/components/admin/admin-layout';
import { VendorPayoutBalancePanel } from '@/components/vendor/vendor-payout-balance-panel';
import { VendorPayoutHistoryPanel } from '@/components/vendor/vendor-payout-history-panel';
import { VendorPayoutSnapshot } from '@/components/vendor/vendor-payout-snapshot';
import { commissionCopy, platformSettingsTabLabels } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import AdminStoreEditPage from './page';
import {
  createPendingManualPayoutsMockResult,
  createUseUpdateStoreAsAdminMockResult,
  liveTenPercentAvailableSummary,
  liveTenPercentVsSnapshotSeven,
  mixedCutoffAvailableWithPendingSummary,
  mixedCutoffFours,
  mixedCutoffWithPendingManual,
  nullRateStore,
  pendingManualSnapshotPayout,
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
const ownerState = { isOwner: true };
const payoutsQueryState: {
  summary: PayoutSummaryCommissionFixture | null;
  isLoading: boolean;
} = {
  summary: null,
  isLoading: false,
};
const payoutsHistoryState: { items: PayoutCommissionFixture[] } = { items: [] };
const pendingManualState: { items: AdminManualPayoutCommissionFixture[] } = { items: [] };

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
  useAdminStorePayoutSummary: () => ({
    data: payoutsQueryState.summary,
    isLoading: payoutsQueryState.isLoading,
  }),
  useAdminStorePayouts: () => ({ data: payoutsHistoryState.items, isLoading: false }),
  useStorePayouts: () => ({ data: payoutsHistoryState.items, isLoading: false }),
  useStorePayoutSummary: () => ({
    data: payoutsQueryState.summary,
    isLoading: payoutsQueryState.isLoading,
    isError: false,
    error: null,
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

vi.mock('@/hooks/usePlatformSettings', () => ({
  useAllPlatformBanners: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAllPlatformSponsors: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAllPlatformAds: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useLoginPageImages: () => ({
    data: { desktopImageUrl: '', mobileImageUrl: '', altText: '' },
    isLoading: false,
    error: null,
  }),
  useUpdateLoginPageImages: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useClearLoginPageDesktopImage: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useClearLoginPageMobileImage: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreatePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformBanner: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useReorderPlatformBanners: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreatePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformSponsor: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useReorderPlatformSponsors: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreatePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useUpdatePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeletePlatformAd: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock('@/components/admin/vendor-combobox', () => ({
  VendorCombobox: () => <input aria-label="เจ้าของร้านค้า" readOnly />,
}));

function rateInput() {
  return screen.getByLabelText(/อัตราค่าคอมมิชชัน/);
}

function lastMutationInput(): Record<string, unknown> | undefined {
  const call = mutateAsync.mock.calls.at(-1)?.[0] as
    { id: string; input: Record<string, unknown> } | undefined;
  return call?.input;
}

describe('store commission — admin rate configure journey [fixture-e2e]', () => {
  beforeEach(() => {
    storeState.current = nullRateStore;
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(nullRateStore);
    mockPush.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('saves a valid 0–100 rate and redirects, rejects invalid rates, and has no commissions console', async () => {
    render(<AdminStoreEditPage />);
    await waitFor(() => {
      expect(rateInput()).toHaveValue(7);
    });
    expect(screen.getByText(HINT_DEFAULT)).toBeInTheDocument();
    expect(screen.queryByText(HINT_CUSTOM)).not.toBeInTheDocument();

    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '5');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }));

    await waitFor(() => {
      expect(lastMutationInput()?.commissionRate).toBe(5);
    });
    expect(mockPush).toHaveBeenCalledWith('/admin/stores');
    expect(screen.queryByText('บันทึกอัตราค่าคอมมิชชันแล้ว')).not.toBeInTheDocument();

    cleanup();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({ ...nullRateStore, commissionRate: 0 });
    mockPush.mockReset();
    render(<AdminStoreEditPage />);
    await waitFor(() => {
      expect(rateInput()).toBeInTheDocument();
    });
    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '0');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }));
    await waitFor(() => {
      expect(lastMutationInput()?.commissionRate).toBe(0);
    });
    expect(mockPush).toHaveBeenCalledWith('/admin/stores');

    cleanup();
    mutateAsync.mockReset();
    mockPush.mockReset();
    render(<AdminStoreEditPage />);
    await waitFor(() => {
      expect(rateInput()).toBeInTheDocument();
    });
    await userEvent.clear(rateInput());
    await userEvent.type(rateInput(), '101');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }));
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
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลร้าน' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    const navHrefs = buildAdminNavSections().flatMap((section) =>
      section.items.map((item) => item.href),
    );
    expect(navHrefs).not.toContain('/admin/commissions');
    expect(navHrefs).toContain('/admin/settings');
    expect(navHrefs).toContain('/admin/manual-payouts');

    expect(Object.keys(platformSettingsTabLabels)).toEqual([
      'banners',
      'sponsors',
      'ads',
      'loginImages',
      'bankTransfer',
    ]);
    expect(JSON.stringify(platformSettingsTabLabels)).not.toMatch(/คอมมิชชัน|commission/i);

    cleanup();
    render(<AdminPlatformSettingsPage />);
    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    expect(screen.queryByText(HINT_DEFAULT)).not.toBeInTheDocument();

    cleanup();
    render(<AdminStoreNewPage />);
    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    expect(screen.queryByText(HINT_DEFAULT)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'สร้างร้านค้า' })).toBeInTheDocument();
  });
});

describe('store commission — admin already-net settlement journey [fixture-e2e]', () => {
  beforeEach(() => {
    payoutsQueryState.summary = mixedCutoffAvailableWithPendingSummary;
    payoutsHistoryState.items = [mixedCutoffWithPendingManual.pendingManual];
    pendingManualState.items = [pendingManualSnapshotPayout];
  });

  afterEach(() => {
    cleanup();
    payoutsQueryState.summary = null;
    payoutsHistoryState.items = [];
    pendingManualState.items = [];
  });

  it('shows combined fours and a single already-net transfer on the store panel and the manual queue', () => {
    const { unmount: unmountPanel } = render(<AdminStorePayoutPanel storeId="store-1" />);

    expect(screen.getAllByText(commissionCopy.breakdown.productSold).length).toBeGreaterThan(0);
    expect(screen.getAllByText(commissionCopy.breakdown.shippingFees).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(commissionCopy.breakdown.commissionDeducted, { exact: false }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(commissionCopy.breakdown.netPayable.admin).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(formatCurrency(mixedCutoffFours.net)).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', {
        name: `อนุมัติหลังโอนแล้ว (${formatCurrency(mixedCutoffFours.net)})`,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /฿1,400/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/ก่อนเปิดใช้/)).not.toBeInTheDocument();
    expect(screen.queryByText(/หลังเปิดใช้/)).not.toBeInTheDocument();
    expect(document.querySelector('details')).toBeNull();
    unmountPanel();

    render(<AdminManualPayoutsPage />);
    expect(screen.getAllByText(formatCurrency(mixedCutoffFours.net)).length).toBeGreaterThan(0);
    expect(screen.getByText(commissionCopy.transfer.caption)).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.productSold)).toBeInTheDocument();
    expect(
      screen.getByText(commissionCopy.breakdown.commissionDeducted, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.netPayable.admin)).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.hint.frozen)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /อนุมัติหลังโอนแล้ว.*฿1,400/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/ก่อนเปิดใช้/)).not.toBeInTheDocument();
    expect(screen.queryByText(/หลังเปิดใช้/)).not.toBeInTheDocument();
    expect(document.querySelector('details')).toBeNull();
    expect(screen.queryByText('netAmount')).not.toBeInTheDocument();
  });
});

describe('store commission — vendor balance and frozen history journey [fixture-e2e]', () => {
  beforeEach(() => {
    ownerState.isOwner = true;
    payoutsQueryState.summary = liveTenPercentAvailableSummary;
    payoutsHistoryState.items = [liveTenPercentVsSnapshotSeven.snapshotPayout];
  });

  afterEach(() => {
    cleanup();
    payoutsQueryState.summary = null;
    payoutsHistoryState.items = [];
  });

  it('carries the same four numbers from dashboard to รับเงิน and keeps history frozen without a rate editor', () => {
    const { unmount: unmountSnapshot } = render(<VendorPayoutSnapshot />);
    expect(screen.getAllByText(commissionCopy.breakdown.productSold).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(
      screen.getAllByText(commissionCopy.breakdown.shippingFees).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText(commissionCopy.breakdown.commissionDeducted, { exact: false }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText(commissionCopy.breakdown.netPayable.vendor).length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(formatCurrency(mixedCutoffFours.net)).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    unmountSnapshot();

    const { unmount: unmountBalance } = render(<VendorPayoutBalancePanel />);
    expect(screen.getAllByText(commissionCopy.breakdown.productSold).length).toBeGreaterThan(0);
    expect(screen.getAllByText(formatCurrency(mixedCutoffFours.net)).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    unmountBalance();

    render(<VendorPayoutHistoryPanel />);
    expect(screen.getByText(commissionCopy.breakdown.productSold)).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.shippingFees)).toBeInTheDocument();
    expect(
      screen.getByText(commissionCopy.breakdown.commissionDeducted, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.netPayable.vendor)).toBeInTheDocument();
    expect(screen.getByText(commissionCopy.breakdown.hint.frozen)).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(70))).toBeInTheDocument();
    expect(screen.queryByText(formatCurrency(140))).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/อัตราค่าคอมมิชชัน/)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
  });
});
