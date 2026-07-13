import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RegisterPage from './page';

const mutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/hooks/useRegisterVendor', () => ({
  useRegisterVendor: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe('RegisterPage', () => {
  it('shows mismatch error when passwords differ', async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Vendor Name');
    await userEvent.type(screen.getByLabelText(/อีเมล/), 'vendor@example.com');
    await userEvent.type(screen.getByPlaceholderText('อย่างน้อย 8 ตัวอักษร'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('กรอกรหัสผ่านอีกครั้ง'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: 'ลงทะเบียน' }));

    expect(screen.getByRole('alert')).toHaveTextContent('รหัสผ่านไม่ตรงกัน');
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits without confirmPassword in API payload', async () => {
    mutateAsync.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', email: 'vendor@example.com', role: 'vendor' },
    });

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/ชื่อ-นามสกุล/), 'Vendor Name');
    await userEvent.type(screen.getByLabelText(/อีเมล/), 'vendor@example.com');
    await userEvent.type(screen.getByPlaceholderText('อย่างน้อย 8 ตัวอักษร'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('กรอกรหัสผ่านอีกครั้ง'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'ลงทะเบียน' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      email: 'vendor@example.com',
      password: 'password123',
      fullName: 'Vendor Name',
    });
  });

  it('has show/hide toggles for both password fields', () => {
    render(<RegisterPage />);

    expect(screen.getAllByRole('button', { name: 'แสดงรหัสผ่าน' })).toHaveLength(2);
  });
});
