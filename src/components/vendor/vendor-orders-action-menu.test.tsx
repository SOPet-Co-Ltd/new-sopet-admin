import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VendorOrdersActionMenu } from './vendor-orders-action-menu';

const ORDER_ID = 'order-abc-123';
const ORDER_NUMBER = 'ORD-MRFTYF80-PSFE';

function renderMenu(overrides: Partial<Parameters<typeof VendorOrdersActionMenu>[0]> = {}) {
  const onViewDetails = vi.fn();
  const onCopyTrackingLink = vi.fn();
  const menuTriggerRef = createRef<HTMLButtonElement>();

  render(
    <VendorOrdersActionMenu
      orderId={ORDER_ID}
      orderNumber={ORDER_NUMBER}
      onViewDetails={onViewDetails}
      onCopyTrackingLink={onCopyTrackingLink}
      menuTriggerRef={menuTriggerRef}
      {...overrides}
    />,
  );

  return { onViewDetails, onCopyTrackingLink, menuTriggerRef };
}

describe('VendorOrdersActionMenu', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * AC: AC-011, AC-012 — Action menu includes both "ดูรายละเอียด" and "คัดลอกลิงก์ติดตาม" items.
   * Behavior: Open action menu trigger → both menu items rendered with correct labels
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrdersActionMenu
   */
  it('renders two menu items when opened', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: `การดำเนินการ ${ORDER_NUMBER}` }));

    expect(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'คัดลอกลิงก์ติดตาม' })).toBeInTheDocument();
  });

  /**
   * AC: AC-011 — Given the vendor orders table, when "ดูรายละเอียด" is selected, then
   * `onViewDetails` is invoked with the row order id (detail dialog wiring).
   * Behavior: Open menu → select view details → onViewDetails called once with orderId
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrdersActionMenu
   */
  it('calls onViewDetails with orderId when view details is selected', async () => {
    const { onViewDetails } = renderMenu();

    await userEvent.click(screen.getByRole('button', { name: `การดำเนินการ ${ORDER_NUMBER}` }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' }));

    expect(onViewDetails).toHaveBeenCalledWith(ORDER_ID);
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  /**
   * AC: AC-012, AC-022 — Selecting "คัดลอกลิงก์ติดตาม" invokes copy handler and stores menu
   * trigger ref for dialog close focus return.
   * Behavior: Open menu → select copy tracking link → onCopyTrackingLink called with orderNumber
   * and menuTriggerRef points to trigger button
   * @category: core-functionality
   * @lane: integration
   * @dependency: VendorOrdersActionMenu, menuTriggerRef
   */
  it('calls onCopyTrackingLink with orderNumber and updates menuTriggerRef', async () => {
    const { onCopyTrackingLink, menuTriggerRef } = renderMenu();

    const trigger = screen.getByRole('button', { name: `การดำเนินการ ${ORDER_NUMBER}` });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'คัดลอกลิงก์ติดตาม' }));

    expect(onCopyTrackingLink).toHaveBeenCalledWith(ORDER_NUMBER);
    expect(onCopyTrackingLink).toHaveBeenCalledTimes(1);
    expect(menuTriggerRef.current).toBe(trigger);
  });
});
