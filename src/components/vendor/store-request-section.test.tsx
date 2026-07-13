import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StoreRequestSection } from './store-request-section';

vi.mock('@/hooks/useStoreRequests', () => ({
  useMyStoreRequests: () => ({ data: [], isLoading: false, error: null }),
  useSubmitStoreRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: () => <div data-testid="image-upload-field" />,
}));

import { useCurrentUser } from '@/hooks/useAuth';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

describe('StoreRequestSection', () => {
  it('shows minimal inline hint instead of full notice when email is unverified', async () => {
    const user = userEvent.setup();
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

    render(<StoreRequestSection open onOpenChange={vi.fn()} showTrigger={false} />);

    expect(screen.queryByText('ยังไม่ได้ยืนยันอีเมล')).not.toBeInTheDocument();
    expect(screen.getByText(/กรุณายืนยันอีเมลก่อนส่งคำขอ/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ดูวิธียืนยัน' })).toHaveAttribute(
      'href',
      '#email-verification-banner',
    );

    const submitButton = screen.getByRole('button', { name: 'ส่งคำขอเปิดร้าน' });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    expect(submitButton).toBeDisabled();
  });
});
