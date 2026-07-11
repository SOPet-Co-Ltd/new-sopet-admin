import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorOrderTrackingLinkDialog } from './vendor-order-tracking-link-dialog';

vi.mock('@/hooks/usePlatformStorefrontUrl', () => ({
  usePlatformStorefrontUrl: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: vi.fn(),
}));

import { usePlatformStorefrontUrl } from '@/hooks/usePlatformStorefrontUrl';
import { useToast } from '@/components/ui/toast';

const mockedUsePlatformStorefrontUrl = vi.mocked(usePlatformStorefrontUrl);
const mockedUseToast = vi.mocked(useToast);

const ORDER_NUMBER = 'ORD-MRFTYF80-PSFE';
const STOREFRONT_URL = 'https://shop.example.com/';
const EXPECTED_TRACKING_URL = 'https://shop.example.com/track/ORD-MRFTYF80-PSFE';

function renderDialog(
  overrides: Partial<Parameters<typeof VendorOrderTrackingLinkDialog>[0]> = {},
) {
  const onOpenChange = vi.fn();
  const menuTriggerRef = createRef<HTMLButtonElement>();

  render(
    <VendorOrderTrackingLinkDialog
      orderNumber={ORDER_NUMBER}
      open
      onOpenChange={onOpenChange}
      menuTriggerRef={menuTriggerRef}
      {...overrides}
    />,
  );

  return { onOpenChange, menuTriggerRef };
}

describe('VendorOrderTrackingLinkDialog', () => {
  const show = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockedUseToast.mockReturnValue({ show, showError: vi.fn() });
  });

  it('renders dialog header and order number', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByRole('heading', { name: 'ลิงก์ติดตามคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByText(ORDER_NUMBER)).toBeInTheDocument();
  });

  it('shows loading placeholder while storefrontUrl is fetching', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' })).toBeDisabled();
  });

  it('displays normalized tracking URL when storefrontUrl is loaded', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByText(EXPECTED_TRACKING_URL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' })).toBeEnabled();
  });

  it('copies tracking URL and shows success toast', async () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' }));

    expect(writeText).toHaveBeenCalledWith(EXPECTED_TRACKING_URL);
    expect(show).toHaveBeenCalledWith('คัดลอกลิงก์แล้ว', 'success');
  });

  it('disables copy and shows inline error when settings fetch fails', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByText('โหลดไม่สำเร็จ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' })).toBeDisabled();
  });

  it('shows error toast when clipboard write is denied', async () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });

    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' }));

    expect(show).toHaveBeenCalledWith('ไม่สามารถคัดลอกได้', 'error');
  });
});
