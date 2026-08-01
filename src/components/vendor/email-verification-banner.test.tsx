import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailVerificationBanner } from './email-verification-banner';

const mutateMock = vi.fn();

vi.mock('@/hooks/useEmailVerification', () => ({
  useSyncEmailVerificationStatus: vi.fn(() => ({ isChecking: false })),
  useResendEmailVerification: () => ({
    mutate: mutateMock,
    isPending: false,
    isSuccess: false,
    error: null,
    isCooldown: false,
    isResendDisabled: false,
    resendButtonLabel: 'ส่งอีเมลยืนยันอีกครั้ง',
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
}));

import { useCurrentUser } from '@/hooks/useAuth';
import { useSyncEmailVerificationStatus } from '@/hooks/useEmailVerification';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);
const mockedUseSyncEmailVerificationStatus = vi.mocked(useSyncEmailVerificationStatus);

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    mockedUseSyncEmailVerificationStatus.mockReturnValue({ isChecking: false });
  });

  it('renders notice when vendor is logged in and email is unverified', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: false,
      },
      isAuthenticated: true,
    });

    render(<EmailVerificationBanner />);

    expect(screen.getByText('ยังไม่ได้ยืนยันอีเมล')).toBeInTheDocument();
    expect(screen.getByText(/vendor@test.com/)).toBeInTheDocument();
  });

  it('renders nothing when email is verified', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: true,
      },
      isAuthenticated: true,
    });

    const { container } = render(<EmailVerificationBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when user is not authenticated', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { container } = render(<EmailVerificationBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while the freshness check is still in flight, even if the persisted status is unverified', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: false,
      },
      isAuthenticated: true,
    });
    mockedUseSyncEmailVerificationStatus.mockReturnValue({ isChecking: true });

    const { container } = render(<EmailVerificationBanner />);

    expect(container).toBeEmptyDOMElement();
  });
});
