/**
 * AC-022 residual (order-tracking-frontend-task-14): focus-trap-while-open is Phase 4 manual
 * verification; close-time focus return to menu trigger is covered by RTL below.
 */
import { createRef, useState } from 'react';
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

  /**
   * AC: AC-012 — Given the action menu, when the vendor selects the tracking-link action, then a
   * dialog opens showing the full URL for that row's order.
   * Behavior: Render dialog with loaded storefrontUrl → dialog header and order number visible
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, usePlatformStorefrontUrl mock
   */
  it('renders dialog header and order number', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByRole('heading', { name: 'ลิงก์ติดตามคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('dialog').textContent).toContain(ORDER_NUMBER);
  });

  /**
   * AC: AC-012 — Tracking-link dialog displays URL when settings are available; loading state while
   * `platformSettings.storefrontUrl` is fetching.
   * Behavior: Mock hook isLoading → loading placeholder shown and copy button disabled
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, usePlatformStorefrontUrl mock
   */
  it('shows loading placeholder while storefrontUrl is fetching', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByText('กำลังโหลดลิงก์...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' })).toBeDisabled();
  });

  /**
   * AC: AC-012, AC-017 — Dialog shows full normalized `{storefrontUrl}/track/{orderNumber}` from
   * runtime platform settings (trailing slash stripped).
   * Behavior: Mock loaded storefrontUrl → normalized tracking URL displayed and copy enabled
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, usePlatformStorefrontUrl mock
   */
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

  /**
   * AC: AC-013 — Given the tracking-link dialog, when the vendor clicks copy, then the URL is
   * copied to clipboard and success feedback is shown.
   * Behavior: Click copy button → clipboard.writeText called with tracking URL and success toast shown
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, useToast mock, navigator.clipboard mock
   */
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

  /**
   * AC: AC-012 — When platform settings fail to load, dialog shows error state and copy is disabled.
   * Behavior: Mock settings fetch error → inline error message shown and copy button disabled
   * @category: edge-case
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, usePlatformStorefrontUrl mock
   */
  it('disables copy and shows inline error when settings fetch fails', () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    renderDialog();

    expect(screen.getByText('โหลดลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'คัดลอกลิงก์ติดตาม' })).toBeDisabled();
  });

  /**
   * AC: AC-013 — On clipboard denial, error toast `ไม่สามารถคัดลอกได้` is shown.
   * Behavior: Mock clipboard.writeText rejection → click copy → error toast displayed
   * @category: edge-case
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, useToast mock, navigator.clipboard mock
   */
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

  /**
   * AC: AC-022 — Given the admin tracking-link dialog, when closed, focus returns to the menu
   * trigger element (focus-trap-while-open deferred to Phase 4 manual).
   * Behavior: Open dialog → click close → menu trigger receives focus
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrderTrackingLinkDialog, menuTriggerRef
   */
  it('returns focus to menu trigger when dialog closes', async () => {
    mockedUsePlatformStorefrontUrl.mockReturnValue({
      data: STOREFRONT_URL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePlatformStorefrontUrl>);

    const menuTriggerRef = createRef<HTMLButtonElement>();

    function FocusReturnHarness() {
      const [open, setOpen] = useState(true);

      return (
        <div>
          <button ref={menuTriggerRef} type="button">
            Menu trigger
          </button>
          <VendorOrderTrackingLinkDialog
            orderNumber={ORDER_NUMBER}
            open={open}
            onOpenChange={setOpen}
            menuTriggerRef={menuTriggerRef}
          />
        </div>
      );
    }

    render(<FocusReturnHarness />);

    const menuTrigger = menuTriggerRef.current;
    expect(menuTrigger).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'ปิด' }));

    expect(menuTrigger).toHaveFocus();
  });
});
