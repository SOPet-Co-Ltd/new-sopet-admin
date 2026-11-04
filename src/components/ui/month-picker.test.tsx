import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MonthPicker } from './month-picker';

describe('MonthPicker', () => {
  it('shows the selected Thai month and Buddhist year on the trigger', () => {
    render(
      <MonthPicker
        value={{ year: 2026, month: 10 }}
        min={{ year: 2026, month: 7 }}
        max={{ year: 2026, month: 10 }}
        onChange={vi.fn()}
        aria-label="เดือน"
      />,
    );

    expect(screen.getByRole('button', { name: 'เดือน' })).toHaveTextContent('ตุลาคม 2569');
  });

  it('disables months before min and selects an allowed month', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MonthPicker
        value={{ year: 2026, month: 10 }}
        min={{ year: 2026, month: 7 }}
        max={{ year: 2026, month: 10 }}
        onChange={onChange}
        aria-label="เดือน"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'เดือน' }));

    expect(screen.getByRole('option', { name: 'มิถุนายน' })).toBeDisabled();
    await user.click(screen.getByRole('option', { name: 'กรกฎาคม' }));

    expect(onChange).toHaveBeenCalledWith({ year: 2026, month: 7 });
  });
});
