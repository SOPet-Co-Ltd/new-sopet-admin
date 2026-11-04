import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomerSummaryMonthPicker } from './customer-summary-month-picker';

describe('CustomerSummaryMonthPicker', () => {
  it('renders a custom month picker trigger with the selected month', () => {
    render(
      <CustomerSummaryMonthPicker
        id="customer-purchase-summary-month"
        year={2026}
        month={10}
        minYearMonth={{ year: 2026, month: 7 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'เดือน' })).toHaveTextContent('ตุลาคม 2569');
  });

  it('clamps a selected month earlier than account creation up to min', () => {
    const onChange = vi.fn();
    render(
      <CustomerSummaryMonthPicker
        id="customer-purchase-summary-month"
        year={2026}
        month={3}
        minYearMonth={{ year: 2026, month: 7 }}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'เดือน' })).toHaveTextContent('กรกฎาคม 2569');
    expect(onChange).toHaveBeenCalledWith({ year: 2026, month: 7 });
  });
});
