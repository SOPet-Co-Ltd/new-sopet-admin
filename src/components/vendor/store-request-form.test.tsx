import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreRequestForm } from './store-request-form';

const mutateAsync = vi.fn();

vi.mock('@/hooks/useStoreRequests', () => ({
  useSubmitStoreRequest: () => ({
    mutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: () => ({
    user: {
      id: '1',
      email: 'vendor@test.com',
      fullName: 'Vendor',
      role: 'vendor',
      emailVerified: true,
    },
    isAuthenticated: true,
  }),
}));

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: () => <div data-testid="image-upload-field" />,
}));

describe('StoreRequestForm', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({ id: 'req-1' });
  });

  it('omits blank optional fields so empty phone/email do not fail backend validation', async () => {
    const user = userEvent.setup();
    render(<StoreRequestForm />);

    await user.type(screen.getByLabelText(/ชื่อร้านค้า/), 'ร้านทดสอบ');
    await user.click(screen.getByRole('button', { name: 'ส่งคำขอเปิดร้าน' }));

    expect(mutateAsync).toHaveBeenCalledWith({
      storeName: 'ร้านทดสอบ',
      description: undefined,
      contactPhone: undefined,
      contactEmail: undefined,
      address: undefined,
      logoUrl: undefined,
    });
  });
});
