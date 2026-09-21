import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker } from './date-time-picker';

describe('DateTimePicker min', () => {
  it('disables days before min and clamps time to min on same day', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateTimePicker
        mode="datetime"
        value="2026-09-21T15:00"
        onChange={onChange}
        min="2026-09-21T14:30"
      />,
    );

    await user.click(screen.getByRole('button', { name: /21 ก\.ย\. 2569/ }));

    expect(screen.getByRole('button', { name: /20 กันยายน 2569/ })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('ชั่วโมง'), { target: { value: '10' } });

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0] as string;
    expect(last).toBe('2026-09-21T14:30');
  });
});
