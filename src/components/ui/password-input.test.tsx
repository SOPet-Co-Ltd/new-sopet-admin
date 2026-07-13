import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('toggles password visibility', async () => {
    render(<PasswordInput id="password" aria-label="รหัสผ่าน" />);

    const input = screen.getByLabelText('รหัสผ่าน');
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: 'แสดงรหัสผ่าน' }));
    expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(screen.getByRole('button', { name: 'ซ่อนรหัสผ่าน' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
