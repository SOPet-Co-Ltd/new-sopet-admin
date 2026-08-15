import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildAdminNavSections } from '@/components/admin/admin-layout';
import { platformSettingsTabLabels } from '@/lib/i18n/th';
import AdminPlatformSettingsPage from '@/app/admin/settings/page';
import AdminStoreNewPage from '@/app/admin/stores/new/page';
import AdminStoreEditPage from './page';
import { createUseUpdateStoreAsAdminMockResult, nullRateStore } from './store-commission.fixtures';

const HINT_DEFAULT =
  'ค่าเริ่มต้นของแพลตฟอร์มคือ 7% หากไม่กำหนดอัตราเฉพาะร้าน · 0% หมายถึงไม่หักค่าคอมมิชชัน';
const HINT_CUSTOM = 'อัตรานี้ใช้กับยอดสินค้าหลังวันเปิดใช้สูตรใหม่เท่านั้น — ไม่หักจากค่าจัดส่ง';
const RANGE_ERROR = 'กรุณากรอกอัตรา 0 ถึง 100';
const INVALID_ERROR = 'กรุณากรอกตัวเลขเปอร์เซ็นต์ที่ถูกต้อง';

const storeState = { current: nullRateStore };
const mutateAsync = vi.fn();
const mockPush = vi.fn();

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
