import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminStoreNewPage from './page';

const mutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useAdminStores', () => ({
  useCreateStoreAsAdmin: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/components/admin/vendor-combobox', () => ({
  VendorCombobox: ({
    fieldError,
    'aria-invalid': ariaInvalid,
  }: {
    fieldError?: string;
    'aria-invalid'?: boolean;
  }) => (
    <div>
      <input id="ownerId" aria-invalid={ariaInvalid} readOnly aria-label="เจ้าของร้านค้า" />
      {fieldError ? (
        <p id="ownerId-error" role="alert">
          {fieldError}
        </p>
      ) : null}
    </div>
  ),
}));

describe('AdminStoreNewPage', () => {
  it('shows required owner validation error on submit without selecting owner', async () => {
    render(<AdminStoreNewPage />);

    await userEvent.type(screen.getByLabelText(/ชื่อร้านค้า/), 'Pet Shop');
    await userEvent.click(screen.getByRole('button', { name: 'สร้างร้านค้า' }));

    expect(screen.getByRole('alert')).toHaveTextContent('กรุณาเลือกเจ้าของร้านค้า');
    expect(screen.getByLabelText('เจ้าของร้านค้า')).toHaveAttribute('aria-invalid', 'true');
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
