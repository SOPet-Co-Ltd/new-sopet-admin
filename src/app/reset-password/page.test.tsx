import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';

let mockSearchParams = new URLSearchParams('token=tok-1');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

const useResetPassword = vi.fn();
const usePasswordResetTokenStatus = vi.fn();

vi.mock('@/hooks/usePasswordReset', () => ({
  useResetPassword: () => useResetPassword(),
  usePasswordResetTokenStatus: (token: string) => usePasswordResetTokenStatus(token),
}));

describe('ResetPasswordPage (row 33 regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/reset-password');
    mockSearchParams = new URLSearchParams('token=tok-1');
    useResetPassword.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows a loading state while the token is being checked, not the form', () => {
    usePasswordResetTokenStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText('กำลังตรวจสอบลิงก์...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).not.toBeInTheDocument();
  });

  it('shows an expired-link message instead of the form when the token has expired', () => {
    usePasswordResetTokenStatus.mockReturnValue({
      data: { valid: false, status: 'expired' },
      isLoading: false,
      isError: false,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText(/ลิงก์นี้หมดอายุแล้ว/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).not.toBeInTheDocument();
  });

  it('shows an already-used message instead of the form when the token was already used', () => {
    usePasswordResetTokenStatus.mockReturnValue({
      data: { valid: false, status: 'used' },
      isLoading: false,
      isError: false,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText(/ลิงก์นี้ถูกใช้ไปแล้ว/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).not.toBeInTheDocument();
  });

  it('renders the password form once the token is confirmed valid', () => {
    usePasswordResetTokenStatus.mockReturnValue({
      data: { valid: true, status: 'valid' },
      isLoading: false,
      isError: false,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' })).toBeInTheDocument();
  });

  it('shows an invalid-link message immediately when there is no token at all', () => {
    mockSearchParams = new URLSearchParams();
    usePasswordResetTokenStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).not.toBeInTheDocument();
  });

  it('fails closed with an invalid-link message if the status check itself errors', () => {
    usePasswordResetTokenStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByText('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('อย่างน้อย 8 ตัวอักษร')).not.toBeInTheDocument();
  });
});
