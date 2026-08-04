import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  it('opens the calendar panel and shows Buddhist era years', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePicker
        id="customer-dob"
        value=""
        onChange={handleChange}
        min="1990-01-01"
        max="1990-12-31"
        data-testid="customer-dob-picker"
      />,
    );

    await user.click(screen.getByTestId('customer-dob-picker-trigger'));

    expect(screen.getByRole('dialog', { name: 'เลือกวันที่' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'ปฏิทิน' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2533' })).toBeInTheDocument();
  });

  it('selects a date in YYYY-MM-DD format and closes the panel', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePicker
        value="1990-05-01"
        onChange={handleChange}
        min="1990-01-01"
        max="1990-12-31"
        data-testid="birthday-picker"
      />,
    );

    await user.click(screen.getByTestId('birthday-picker-trigger'));
    await user.click(screen.getByRole('gridcell', { name: '15' }));

    expect(handleChange).toHaveBeenCalledWith('1990-05-15');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables dates outside min and max range', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePicker
        value=""
        onChange={handleChange}
        min="1990-05-10"
        max="1990-05-20"
        data-testid="range-picker"
      />,
    );

    await user.click(screen.getByTestId('range-picker-trigger'));

    expect(screen.getByRole('gridcell', { name: '9' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '21' })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: '15' })).not.toBeDisabled();
  });
});
