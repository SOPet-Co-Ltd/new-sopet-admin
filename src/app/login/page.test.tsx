import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ clear: vi.fn() }),
  };
});

vi.mock('@/lib/api/client', () => ({
  getAccessToken: () => undefined,
}));

vi.mock('@/lib/auth-session', () => ({
  AUTH_SESSION_MESSAGE_KEY: 'sopet-admin-auth-message',
  clearAuthSession: vi.fn(),
}));

const useCurrentUser = vi.fn();
const login = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: () => useCurrentUser(),
  useLogin: () => login,
  getDashboardPath: () => '/admin/analytics',
}));

const requestReset = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/hooks/usePasswordReset', () => ({
  useRequestPasswordReset: () => requestReset,
}));

function openForgotPasswordForm() {
  fireEvent.click(screen.getByRole('button', { name: 'ลืมรหัสผ่าน?' }));
}

describe('LoginPage forgot-password message styling (row 30 regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrentUser.mockReturnValue({ user: null, isAuthenticated: false });
  });

  it('shows the success message in success styling, not plain gray muted text', async () => {
    requestReset.mutateAsync.mockResolvedValue('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');

    render(<LoginPage />);
    openForgotPasswordForm();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'vendor@sopet.org' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }));

    const message = await screen.findByRole('status');
    expect(message).toHaveTextContent('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
    expect(message.className).toContain('text-success');
    expect(message.className).not.toContain('text-muted');
  });

  it('shows a failed request in danger/alert styling, distinct from the success case', async () => {
    requestReset.mutateAsync.mockRejectedValue(new Error('ส่งคำขอไม่สำเร็จ'));

    render(<LoginPage />);
    openForgotPasswordForm();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'vendor@sopet.org' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }));

    const message = await waitFor(() => screen.getByRole('alert'));
    expect(message).toHaveTextContent('ส่งคำขอไม่สำเร็จ');
    expect(message.className).toContain('text-danger');
  });
});
