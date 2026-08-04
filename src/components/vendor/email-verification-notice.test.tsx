import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmailVerificationNotice } from './email-verification-notice';

const mutateMock = vi.fn();

const mockResendState = {
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
  isCooldown: false,
  isResendDisabled: false,
  resendButtonLabel: 'ส่งอีเมลยืนยันอีกครั้ง',
};

vi.mock('@/hooks/useEmailVerification', () => ({
  useResendEmailVerification: () => ({
    mutate: mutateMock,
    ...mockResendState,
  }),
}));

describe('EmailVerificationNotice', () => {
  it('shows Thai guidance and resend action in page-level banner', async () => {
    const user = userEvent.setup();
    render(<EmailVerificationNotice email="vendor@test.com" />);

    expect(screen.getByText('ยังไม่ได้ยืนยันอีเมล')).toBeInTheDocument();
    expect(screen.getByText(/vendor@test.com/)).toBeInTheDocument();
    expect(document.getElementById('email-verification-banner')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ส่งอีเมลยืนยันอีกครั้ง' }));
    expect(mutateMock).toHaveBeenCalled();
  });

  it('disables resend button and shows countdown during cooldown', () => {
    mockResendState.isSuccess = true;
    mockResendState.isCooldown = true;
    mockResendState.isResendDisabled = true;
    mockResendState.resendButtonLabel = 'ส่งอีเมลอีกครั้งใน 45 วินาที';

    render(<EmailVerificationNotice email="vendor@test.com" />);

    const button = screen.getByRole('button', { name: 'ส่งอีเมลอีกครั้งใน 45 วินาที' });
    expect(button).toBeDisabled();
    expect(screen.getByText('ส่งอีเมลแล้ว — กรุณาตรวจสอบกล่องจดหมาย')).toBeInTheDocument();

    mockResendState.isSuccess = false;
    mockResendState.isCooldown = false;
    mockResendState.isResendDisabled = false;
    mockResendState.resendButtonLabel = 'ส่งอีเมลยืนยันอีกครั้ง';
  });
});
