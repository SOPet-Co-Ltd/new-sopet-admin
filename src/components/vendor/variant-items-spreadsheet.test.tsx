import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { VariantItem } from '@/lib/variants';
import { VariantItemsSpreadsheet } from './variant-items-spreadsheet';

function StatefulHarness({ initialItems }: { initialItems: VariantItem[] }) {
  const [items, setItems] = useState(initialItems);
  return <VariantItemsSpreadsheet items={items} onChange={setItems} />;
}

const items: VariantItem[] = [
  { id: 'v1', sku: 'SKU-RED', stockQuantity: 5, price: 100, options: { สี: 'แดง' } },
  { id: 'v2', sku: 'SKU-BLUE', stockQuantity: 0, price: 120, options: { สี: 'น้ำเงิน' } },
];

describe('VariantItemsSpreadsheet', () => {
  it('shows a custom empty message when there are no items', () => {
    const onChange = vi.fn();
    render(
      <VariantItemsSpreadsheet
        items={[]}
        onChange={onChange}
        emptyMessage="ยังไม่มีตัวเลือก — เพิ่มกลุ่มตัวเลือกด้านบน"
      />,
    );

    expect(screen.getByText('ยังไม่มีตัวเลือก — เพิ่มกลุ่มตัวเลือกด้านบน')).toBeInTheDocument();
  });

  it('applies bulk stock and price to every row when only one field is filled in', async () => {
    const onChange = vi.fn();
    render(<VariantItemsSpreadsheet items={items} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('สต็อก (ทุกรายการ)'), '50');
    await userEvent.click(screen.getByRole('button', { name: 'ใช้กับทุกรายการ' }));

    expect(onChange).toHaveBeenCalledWith([
      { ...items[0], stockQuantity: 50 },
      { ...items[1], stockQuantity: 50 },
    ]);
  });

  it('disables the bulk apply button until at least one bulk field has a value', () => {
    const onChange = vi.fn();
    render(<VariantItemsSpreadsheet items={items} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'ใช้กับทุกรายการ' })).toBeDisabled();
  });

  it('removes a single row from the desktop table without needing to touch option groups', async () => {
    const onChange = vi.fn();
    render(<VariantItemsSpreadsheet items={items} onChange={onChange} />);

    const table = within(screen.getByRole('table'));
    await userEvent.click(table.getByRole('button', { name: /ลบรายการ.*แดง/ }));

    expect(onChange).toHaveBeenCalledWith([items[1]]);
  });

  it('removes a single row from the mobile card list', async () => {
    const onChange = vi.fn();
    render(<VariantItemsSpreadsheet items={items} onChange={onChange} />);

    const [mobileDeleteButton] = screen.getAllByRole('button', { name: /ลบรายการ.*แดง/ });
    await userEvent.click(mobileDeleteButton!);

    expect(onChange).toHaveBeenCalledWith([items[1]]);
  });

  it('edits a single SKU field from the desktop table', async () => {
    render(<StatefulHarness initialItems={items} />);

    const table = within(screen.getByRole('table'));
    const skuInput = table.getByDisplayValue('SKU-RED');
    await userEvent.clear(skuInput);
    await userEvent.type(skuInput, 'SKU-RED-2');

    expect(table.getByDisplayValue('SKU-RED-2')).toBeInTheDocument();
  });
});
