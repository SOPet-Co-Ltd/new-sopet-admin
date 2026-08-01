import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StockRow } from './stock-row';

describe('StockRow', () => {
  it('truncates a very long option label instead of letting it overflow into the qty input', () => {
    const longLabel =
      'สี: แดงเข้มสดใสพิเศษ / ไซส์: Extra Extra Large Deluxe Limited Edition Premium Collection';

    render(
      <StockRow
        id="v1"
        label={longLabel}
        sku="SKU-1"
        originalStock={10}
        draftValue="10"
        onChange={vi.fn()}
      />,
    );

    const labelEl = screen.getByText(longLabel);
    // Both classes are required together: `truncate` alone doesn't stop a flex item from
    // overflowing (its default min-width:auto keeps it at full text width) - min-w-0 must
    // sit directly on this element, not just an ancestor, or a long option label visually
    // overlaps the "จำนวนใหม่" qty input next to it.
    expect(labelEl.className).toContain('truncate');
    expect(labelEl.className).toContain('min-w-0');
  });
});
