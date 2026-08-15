import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminStoreEditPage from './page';
import {
  createUseUpdateStoreAsAdminMockResult,
  customZeroRateStore,
  nullRateStore,
} from './store-commission.fixtures';

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

describe('store commission — admin store-detail rate field [integration]', () => {
  beforeEach(() => {
    storeState.current = nullRateStore;
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(nullRateStore);
    mockPush.mockReset();
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
