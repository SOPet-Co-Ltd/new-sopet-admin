import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorProductsActionMenu } from './vendor-products-action-menu';

describe('VendorProductsActionMenu', () => {
  it('links แก้ไขสต็อก to the dedicated stock page', async () => {
    const user = userEvent.setup();
    render(<VendorProductsActionMenu productId="prod-1" productName="test" onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'การดำเนินการ test' }));

    expect(screen.getByRole('menuitem', { name: 'แก้ไขสต็อก' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/stock',
    );
  });

  it('links แก้ไขตัวเลือก to the dedicated variants page', async () => {
    const user = userEvent.setup();
    render(<VendorProductsActionMenu productId="prod-1" productName="test" onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'การดำเนินการ test' }));

    expect(screen.getByRole('menuitem', { name: 'แก้ไขตัวเลือก' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/variants',
    );
  });
});
