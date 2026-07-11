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

  it('renders two menu items when opened', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: `การดำเนินการ ${ORDER_NUMBER}` }));

    expect(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'คัดลอกลิงก์ติดตาม' })).toBeInTheDocument();
  });

  it('calls onViewDetails with orderId when view details is selected', async () => {
    const { onViewDetails } = renderMenu();

    await userEvent.click(screen.getByRole('button', { name: `การดำเนินการ ${ORDER_NUMBER}` }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' }));

    expect(onViewDetails).toHaveBeenCalledWith(ORDER_ID);
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

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
